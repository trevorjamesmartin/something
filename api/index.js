const { server } = require('./socket');
// const { api: server } = require("./rest");

const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

//serve it up
server.listen(port, host, () => {
  console.log(`listening @ http://${host}:${port}`);
});
