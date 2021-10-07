const { randomUUID } = require("crypto");
const { createServer } = require("http");

const { WebSocketServer, OPEN } = require("ws");
const { api } = require("../rest");
const server = createServer(api);

/**
 *
 * @param {Object} jsonObj
 * @returns {URLSearchParams} params loaded with jsonObj
 */
function loadSearchParams(jsonObj) {
  const keys = Object.keys(jsonObj);
  params = new URLSearchParams();
  params.set("keys", keys);
  keys.forEach((keyName) => params.set(keyName, jsonObj[keyName]));
  return params;
}

const wss = new WebSocketServer({
  server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
});

// cache
let clients = [];

/**
 * broadcast the userlist to all connected clients
 */
function broadcastNames() {
  const userlist = loadSearchParams({
    foo: "userlist",
    names: [...clients.map((u) => u.name)],
  });
  wss.clients.forEach(function each(wsClient) {
    // (public broadcast)
    if (wsClient.readyState === OPEN && wsClient.session) {
      wsClient.send(userlist.toString(), { binary: false });
    }
  });
}

/**
 * broadcast
 * @param {*} data
 * @param {boolean} isBinary
 */
function broadcast(data, isBinary) {
  wss.clients.forEach(function each(wsClient) {
    if (wsClient.readyState === OPEN && wsClient.session) {
      wsClient.send(data, { binary: isBinary });
    }
  });
}



function registerClient(ip, name, key, opt) {
  const existing = clients.find((client) => client.key === key);
  if (!existing) {
    console.log("client didn't say Hello. How rude!");
    return false;
  }
  let reply;
  switch (opt) {
    case "changed-name":
      reply = `*** [${name}] was formerly known as [${existing?.name}] ***`;
      break;
    default:
      reply = `*** [${name}] joined the chat ***`
      break;
  }
  const others = clients.filter((client) => client.key !== key);
  // update client record
  existing["name"] = name;
  existing["ip"] = ip;
  clients = [...others, existing];
  return [existing.session, reply];
}

function addClient(ip, key, session, oldSession, oldName) {
  if (!clients.find((v) => v.session === oldSession)) {
    // add new client
    clients = [...clients, { ip, key, session }];
  } else {
    // update existing client
    console.log(oldName);
    clients = clients.map((v) =>
      v.session === oldSession ? { ...v, ip, key, session } : v
    );
  }
  return true;
}

const pulseCheck = setInterval(function ping() {
  let removed = 0;
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      // remove from list
      console.log("removing ", ws?.clientKey);
      clients = clients.filter((c) => c.clientKey !== ws.clientKey);
      removed += 1;
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
  removed > 0 && broadcastNames();
}, 3000);

wss.on("close", function close() {
  clearInterval(pulseCheck);
});

wss.on("connection", function connection(ws, req, client) {
  const ip = req.socket.remoteAddress;
  const clientKey = req.headers["sec-websocket-key"]; // changes at browser re-fresh
  ws.isAlive = true; // initially set to true
  ws.clientKey = clientKey;

  ws.on("pong", function heartbeat() {
    ws.isAlive = true; // keep alive
  });

  ws.on("close", function (event) {
    const closing = clients.find((c) => c.key === ws.clientKey);
    if (closing) {
      console.log("GOODBYE, ", closing.name);
      broadcast(
        loadSearchParams({
          foo: "chat",
          name: "@channel",
          data: `*** ${closing.name} disconnected ***`,
        }).toString(),
        false
      );
      clients = clients.filter((c) => c.key !== ws.clientKey);
      broadcastNames();
    }
    ws.isAlive = false;
    ws.terminate();
  });

  ws.on("message", function incoming(data, isBinary) {
    let msg, params, sessionKey;
    if (!isBinary) {
      msg = data.toString();
    }
    // ?
    if (msg?.startsWith("?")) {
      // reconstruct
      params = new URLSearchParams(msg.slice(1)); // params
      msg = params.get("foo"); // target
    }
    // see also: client/src/helpers/ws.js
    switch (msg) {
      case "yo":
        console.log(
          `[ws] connection from ${ip}; last connnection: ${params.get(
            "session"
          )}`
        );
        // update session ID
        sessionKey = randomUUID(); // random unique identification
        ws.session = sessionKey;
        if (
          addClient(
            ip,
            clientKey,
            sessionKey,
            params.get("session"),
            params.get("name")
          )
        ) {
          ws.send(
            loadSearchParams({
              foo: "yo",
              session: sessionKey,
            }).toString()
          );
        }
        break;
      case "register":
        const alias = params.get("name");
        const option = params.get("opt");
        const [session, reply] = registerClient(ip, alias, clientKey, option);
        if (session) {
          broadcast(
            loadSearchParams({
              foo: "chat",
              name: "@channel",
              data: reply,
            }).toString(),
            false
          );
          broadcastNames(); // update public
          // update sender
          ws.send(
            loadSearchParams({
              foo: "yo",
              session: session,
              name: alias,
            }).toString()
          );
        }
        ws.send("ping");
        break;

      default:

        broadcast(data, isBinary); // update public
        break;
    }
  });
});

module.exports = { server };
