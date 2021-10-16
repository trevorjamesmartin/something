const { server } = require("./socket");
const { log } = require("./middleware/logger");
// const { api: server } = require("./rest");

const port = process.env.CONTAINER_PORT || "8080";
const host = process.env.HOST || "0.0.0.0";

//serve it up
server.listen(port, host, () => {
  log(`listening @ http://${host}:${port}`);
  if (process.env.API_URL) {
    log(`API ${process.env.API_URL}`);
  }
});
