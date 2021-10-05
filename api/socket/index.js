const { createServer } = require("http");

const { WebSocketServer, OPEN } = require("ws");
const { api } = require("../rest");
const server = createServer(api);

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

wss.on("connection", function connection(ws, req, client) {
  ws.on("message", function incoming(data, isBinary) {
    // send message to all clients (public chat)
    wss.clients.forEach(function each(client) {
      if (client.readyState === OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});

module.exports = { server };
