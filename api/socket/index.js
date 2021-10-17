const { randomUUID } = require("crypto");
const { createServer } = require("http");

const { log } = require("../middleware/logger");
const redisCache = require("../middleware/redisCache");

const { WebSocketServer, OPEN } = require("ws");
const { api } = require("../rest");
const server = createServer(api);
const { portable, loadPortable } = require("./loaders");

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

/**
 * middleware/redisCache
 *
 * @returns undefined or Redis cache middleware
 */
function getCache() {
  // undefined without REDIS_HOST
  return redisCache?.cache;
}

let cache = getCache();
// const CHAT_CLIENTS = "SOMETHING-CHAT-CLIENTS"; // KEYNAME
// chat clients
let clients = [];

function addClient(ip, key, session, oldSession, oldName) {
  if (!clients.find((v) => v.session === oldSession)) {
    // add new client
    log("add new client");
    clients = [...clients, { ip, key, session, id: randomUUID() }];
  } else {
    // update existing client
    log("update existing", oldName);
    clients = clients.map((v) =>
      v.session === oldSession ? { ...v, ip, key, session } : v
    );
  }
  return true;
}

function getClients(cb) {
  // not sure if/when these should be cached
  return cb(clients);
}

/**
 * remove the client with clientKey from list of clients
 * @param {string} clientKey
 * @returns client
 */
function removeClient(clientKey) {
  let c = clients.find((client) => client.key === clientKey);
  clients = clients.filter((client) => client.key !== clientKey);
  return c;
}

function addSubscriber(clientKey, subscriber) {
  let existing = clients.find((client) => client.key === clientKey);
  let others = clients.filter((client) => client.key !== clientKey);
  existing = { ...existing, subscriber };
  clients = [...others, existing];
}

async function leavesChannel({ ip, key, session, id, name }) {
  let msg = portable({ foo: "@leaves", name, id }).toString();
  let c = removeClient(key);
  cache && c?.subscriber?.quit(); // unsubscribe
  wss.clients.forEach(function each(wsClient) {
    if (wsClient.readyState === OPEN && wsClient.session) {
      wsClient.send(msg, { binary: false });
    }
  });
}

function joinsChannel({ name, option, id }) {
  wss.clients.forEach(function each(wsClient) {
    if (wsClient.readyState === OPEN && wsClient.session) {
      wsClient.send(portable({ foo: "@joins", name, option, id }).toString(), {
        binary: false,
      });
    }
  });
}

let broadCasted = [];

const LIMIT_BROADCASTED = 7;
const CHAT_CHANNEL = "SOMETHING-CHAT-CHANNEL"; // KEYNAME

function getChatLog(returnLog) {
  returnLog(broadCasted);
}

/**
 * broadcast
 * @param {*} data
 * @param {boolean} isBinary
 */
function broadcast(data, isBinary) {
  broadCasted.length >= LIMIT_BROADCASTED && broadCasted.shift();
  broadCasted.push(data.toString());
  if (cache?.isConnected()) {
    // O(1)
    cache.publish(
      CHAT_CHANNEL,
      portable({ [CHAT_CHANNEL]: data.toString() }).toString()
    );
  } else {
    // O(n)
    wss.clients.forEach(function each(wsClient) {
      if (wsClient.readyState === OPEN && wsClient.session) {
        wsClient.send(data, { binary: isBinary });
      }
    });
  }
}

function registerClient(ip, name, key, opt, returnCall) {
  getClients(function (existingClients) {
    const existing = existingClients.find((client) => client.key === key);
    if (!existing) {
      return returnCall(false, 0, "missing initial handshake");
    }
    let reply;
    switch (opt) {
      case "changed-name":
        reply = `*** [${name}] was formerly known as [${existing?.name}] ***`;
        break;
      default:
        reply = `*** [${name}] joined the chat ***`;
        break;
    }
    const others = existingClients.filter((client) => client.key !== key);
    // update client record
    existing["name"] = name;
    existing["ip"] = ip;
    // update clients
    clients = [...others, existing];
    // return with id
    returnCall(existing["session"], existing["id"], reply); // send back the return value
  });
}

const pulseCheck = setInterval(function ping() {
  let removed = 0;
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      // remove from list
      log("removing ", ws?.clientKey);
      if (cache) {
        clients
          .find((client) => client.key === ws?.clientKey)
          ?.subscriber.quit(); // unsubscribe if cache was enabled.
      }
      clients = clients.filter((c) => c.clientKey !== ws.clientKey);
      removed += 1;
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
  removed > 0 && log(`removed ${removed} dead connection(s)`);
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

  ws.on("close", async function (event) {
    log(`event ${event}`);
    const closing = clients.find((c) => c.key === ws.clientKey);
    if (closing) {
      await leavesChannel(closing);
    }
    ws.isAlive = false;
    ws.terminate();
  });

  ws.on("message", function incoming(data, isBinary) {
    let msg, params, sessionKey;
    if (!isBinary) {
      msg = data.toString();
    }
    if (msg?.startsWith("?")) {
      // reconstruct
      params = new URLSearchParams(msg.slice(1)); // params
      msg = params.get("foo"); // target
    }
    // see also: client/src/helpers/ws.js
    switch (msg) {
      case "yo":
        // update session ID
        sessionKey = randomUUID();
        ws.session = sessionKey;
        addClient(
          ip,
          clientKey,
          sessionKey,
          params.get("session"),
          params.get("name")
        );
        // ask client to register
        ws.send(
          portable({
            foo: "yo?",
            session: sessionKey,
          }).toString()
        );
        break;
      case "register":
        const alias = params.get("name");
        const option = params.get("opt");
        registerClient(
          ip,
          alias,
          clientKey,
          option,
          async function (session, id, reply) {
            log(reply);
            joinsChannel({ name: alias, option, id });
            if (cache?.isConnected() && option !== "changed-name") {
              // create a subscriber
              let s = await cache.createSubscription(
                CHAT_CHANNEL,
                function reply(message) {
                  let data = loadPortable(message)[CHAT_CHANNEL];
                  let usp = new URLSearchParams(data);
                  ws.send(usp.toString());
                },
                (error) => log("[error] ->", error)
              );

              addSubscriber(clientKey, s);
            }
            getClients(function (clientList) {
              const users = clientList.map((cli) => ({
                id: cli.id,
                name: cli.name,
              }));
              getChatLog(async function (chatlog) {
                // send response
                ws.send(
                  portable({
                    foo: "yo?",
                    session,
                    name: alias,
                    id,
                    chatlog,
                    users,
                  }).toString(),
                  { binary: false }
                );
              });
              ws.send("ping");
            });
          }
        );
        break;

      default:
        broadcast(data, isBinary); // update public
        break;
    }
  });
});

module.exports = { server };
