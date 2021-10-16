const fs = require("fs");
const path = require("path");
const startTime = Date.now();

let pjson;

try {
    pjson = require(path.join(process.cwd(), "package.json"));
} catch (notFound) {
    pjson = { name: "app" };
}

const logFilename = process.env.LOGFILE ? `${startTime}-${process.env.LOGFILE}` : `${startTime}-${pjson.name}.log`;
const logFoldername = process.env.LOGFOLDER ? process.env.LOGFOLDER : process.cwd();

function getLogFilePaths() {
  return path.resolve(path.join(...[logFoldername, logFilename]));
}

if (process.env.WRITELOG) {
  console.log("logging to ", getLogFilePaths());
}

/**
 * write to log file when
 * WRITELOG=1
 *
 * @param entry message
 */
const log = function (entry) {
  const message = `${new Date().toISOString()} - ${entry}`;
  if (process.env.WRITELOG === "1") {
    try {
      fs.appendFileSync(getLogFilePaths(), message);
    } catch (err) {
      console.log(message);
    }
  } else {
    console.log(message);
  }
};

/**
 * Express Middleware
 * @param req Request
 * @param res Response
 * @param next Next
 */
const logMiddleware = (req, res, next) => {
  req.log = log;
  next();
};

module.exports = { log, logMiddleware };