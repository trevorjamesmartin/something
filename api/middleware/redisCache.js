const redis = require("redis");
const { log } = require("./logger");

const { randomUUID } = require("crypto");

// provides basic access to a redis.createClient() instance
// see https://www.npmjs.com/package/redis
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || "6379";
const DEFAULT_TTL = process.env.DEFAULT_TTL || "60";

const defaultOptions = {
  port: REDIS_PORT || 6379,
  host: process.env.REDIS_HOST,
  options: {},
  name: "redis",
};

let getter =
  REDIS_HOST?.length > 0 ? new redis.RedisClient(defaultOptions) : undefined;
let setter = getter ? new redis.RedisClient(defaultOptions) : undefined;
let publisher = getter ? new redis.RedisClient(defaultOptions) : undefined;

const clients = { getter, setter, publisher };

/**
 * Express Middleware that does nothing
 * @param req Request
 * @param res Response
 * @param next Next
 */
const redisOff = (req, res, next) => {
  req[defaultOptions.name] = undefined;
  next();
};

/**
 *
 * @param port REDIS_PORT
 * @param host REDIS_HOST
 * @param options {}
 * @param name req.key_name
 * @returns Express Middleware
 */
function redisMiddleWare() {
  clients.getter = redis.createClient(defaultOptions);
  clients.setter = clients.getter.duplicate();
  clients.publish = clients.getter.duplicate();
  subscribers = {};
  const keyname = "redis";
  /**
   * Express Middleware - Redis cache
   * @param req Request
   * @param res Response
   * @param next Next
   */
  const middleware = (req, res, next) => {
    if (clients.getter && clients.getter.connected) {
      // already connected,
      req[keyname] = cache;
      next();
    } else {
      // pass redisClient to req, once connected.
      if (clients.getter) {
        clients.getter.on("ready", () => {
          req[keyname] = cache;
          next();
        });
      }
    }
  };

  middleware.clients = clients;
  middleware.connect = (next) => {
    if (clients.getter && clients.getter.connected) {
      // if we're already connected
      clients.getter.once("end", () => {
        // reconnect after this connection ends
        clients.getter = redis.createClient(
          config.port,
          config.host,
          config.options
        );
        clients.setter = clients.getter.duplicate();
        clients.publish = clients.getter.duplicate();
        // proceed with the new connection
        next();
      });
      // end current connection
      clients.getter.quit();
    } else {
      // create the connection
      clients.getter = redis.createClient(
        config.port,
        config.host,
        config.options
      );
      clients.setter = clients.getter.duplicate();
      // proceed
      next();
    }
  };
  middleware.disconnect = (next) => {
    if (clients.getter) {
      clients.getter.once("end", () => {
        clients.getter = undefined;
        clients.setter = undefined;
        next();
      });
      clients.getter.quit();
    } else {
      next();
    }
  };

  /**
   * set the value of name within cache
   * @param name keyname of value in cache
   * @param value string value
   * @param ttl number of seconds to retain this memory
   * @param cb Callback fn(err, value) => value
   * @returns void (use cb)
   */
  function setValue(name, value, ttl, cb) {
    const secondsToLive = ttl ? Number(ttl) : DEFAULT_TTL;
    log(`[cache] WRITE ${name} TTL ${secondsToLive}s`);
    const callBack = cb ? cb : redis.print;
    clients.setter?.setex(name, secondsToLive, value, callBack);
  }

  /**
   * get the value of name from cache
   * @param name keyname of value in cache
   * @param cb Callback fn(err, value) => value
   * @returns void (use cb)
   */
  function getValue(name, cb) {
    return cb ? clients.getter?.get(name, cb) : clients.getter?.get(name);
  }

  function isConnected() {
    return clients?.getter?.connected ? true : false;
  }

  function connect(next) {
    middleware.connect(next);
  }

  function disconnect(next) {
    middleware.disconnect(next);
  }

  function incValue(keyName, cb) {
    const callBack = cb || redis.print;
    clients?.setter?.incr(keyName, callBack);
  }

  function findKeys(pattern, cb) {
    const callBack = cb || redis.print;
    clients?.getter?.keys(pattern, callBack);
  }

  /**
   * create a callback function
   * @param key name of stored value
   * @param onReply function(value) => doSomethingWith(value)
   * @param onError function(err) => doSomethingWith(err)
   * @returns async function
   */
  function createCallback(key, onReply, onError) {
    const errFunc = onError ? onError : redis.print;
    return async function (err, value) {
      if (value && !err) {
        // ie. onReply(value)=> res.json({ value });
        return await onReply(value);
      } else {
        log(`[cache] ${key} not found!`);
        if (onError) {
          // when provided with an error function, call it
          return await errFunc(err);
        }
        // call back with type 'undefined'
        return await onReply(undefined);
      }
    };
  }

  async function createSubscription(target, onReply, onError) {
    // default to a channel
    const t =
      typeof target === "string"
        ? "channel"
        : target.pattern
        ? "pattern"
        : false;

    if (!t) {
      log("[!UNKNOWN SUBSCRIPTION TYPE]");
      return false;
    }

    log(`CREATING SUBSCRIPTION TO ${target}`);

    const cli = clients.getter.duplicate();

    // the subscriber
    let subscriber = {
      subscription: {
        type: t,
        target,
      },
      id: randomUUID(),
      connection: cli,
      quit: () => 0,
    };

    async function connect(s) {
      switch (t) {
        case "channel":
          // 2 calls have to be made.
          cli.subscribe(s.subscription.target);
          cli.on("message", (chan, msg) => {
            onReply(msg);
          });
          s.quit = () =>
            cli.unsubscribe(s.subscription.target, function (err, reply) {
              if (!err) {
                log(`unsubscribed from ${reply}`);
              } else {
                log(`[!ERROR] unsubscribing from ${s.subscription.target}`);
              }
              console.log(reply);
            });
          break;
        case "pattern":
          log("todo");
          break;

        default:
          log("[!UNKNOWN SUBSCRIPTION TYPE]");
          break;
      }
    }
    await connect(subscriber);

    return subscriber;
  }

  function publish(channel, message, cb) {
    clients.publisher.publish(channel, message, cb ? cb : redis.print);
  }

  const cache = {
    publish,
    isConnected,
    getValue,
    setValue,
    connect,
    disconnect,
    incValue,
    findKeys,
    createCallback,
    createSubscription,
  };

  middleware.cache = cache;

  return middleware;
}

/**
 * Express Middleware, connects RedisClient w/ REDIS_HOST
 */
const redisCache = REDIS_HOST?.length > 0 ? redisMiddleWare() : redisOff;

module.exports = redisCache;
