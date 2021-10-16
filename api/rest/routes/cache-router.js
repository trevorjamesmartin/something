const { Router } = require("express");
const redisCache = require("../../middleware/redisCache");
const router = Router();

const simpleCallback = async (value) => res.json({ value });

/**
 * @swagger
 *
 * /cache/:
 *   post:
 *     summary: set a value for {keyname} in the cache (when applicable)
 *     tags:
 *       - cache
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keyname:
 *                 type: string
 *               value:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: ok, created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.post("/", redisCache, async (req, res, nxt) => {
  const rc = req.redis;
  const log = req.log;
  const keyName = req?.body?.keyname;
  // cache connected ?
  if (!rc) {
    log(`cache not connected`);
    return res.status("404").send("cache not connected");
  } else {
    log('CACHE.post ', keyName);
  }
  // assemble incoming parameters
  const stringValue = JSON.stringify(req.body); // stringify the whole body
  if (!keyName) {
    return res.status(403, "keyname required");
  }

  // callback...
  const cb =
    rc?.createCallback(keyName, async (value) => res.json({ value })) ||
    simpleCallback;

  // set value!
  try {
    await (rc === null || rc === void 0
      ? void 0
      : rc.setValue(keyName, stringValue, 900, cb));
  } catch (err) {
    // problem?
    log(err.message);
  }
});
/**
 * @swagger
 *
 * /cache/{keyname}:
 *   get:
 *     summary: set a value for {keyname}
 *     tags:
 *       - cache
 *     parameters:
 *       - in: path
 *         name: keyname
 *         required: true
 *         description: cache keyname
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ok, created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/:keyname", redisCache, async (req, res, nxt) => {
  const log = req.log;
  const keyName = req.params.keyname;
  const rc = req.redis;
  // cache connected ?
  if (!rc) {
    log(`cache not connected`);
    return res.status("404").send("cache not connected");
  } else {
    log(`CACHE.get ${keyName}`);
  }
  // keyname provided ?
  if (!keyName) {
    return res.status(403, "keyname required");
  }
  // callback, returning the parsed req.body...
  const cb =
    rc?.createCallback(keyName, async (value) => res.json({ value: JSON.parse(value) })) ||
    simpleCallback;

  // get keyName value!
  try {
    await (rc === null || rc === void 0 ? void 0 : rc.getValue(keyName, cb));
  } catch (err) {
    // problem?
    log(err.message);
  }
});

module.exports = router;
