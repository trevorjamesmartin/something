const path = require("path");

const { Router } = require("express");
const Media = require("./media-model");
const router = Router();

const { returnOnlyList, returnOnly } = require("./common");

const PUBLIC = "rest/public";
const BASEURL = "";

const multer = require("multer");
// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  // saving them to the public folder should allow us to serve them
  destination: PUBLIC + "/images",
  filename: (req, file, cb) => {
    const filename = req.body.filename;
    const ext = path.extname(file.originalname);
    cb(null, `ul_${filename}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 15000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|gif)$/)) {
      // upload only png and jpg format
      return cb(
        new Error("Please upload Image in format [png, jpg, jpeg, gif]")
      );
    }
    cb(undefined, true);
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: file name
 *           example: myImage.jpg
 *         description:
 *           type: string
 *           description: A description of the image.
 *           example: Hashplant
 *         data:
 *           type: string
 *           format: binary
 *           description: image file
 */

/**
 * @swagger
 *
 * /media/_name/{name}:
 *   get:
 *     summary: retrieve media with {name}
 *     tags:
 *       - media
 *     description: retrieve media with {name}
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: media name
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: A list of media
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 */
router.get("/_name/:name", async (req, res, nxt) => {
  if (!req.params?.name) {
    res.status(422).send("name ?");
    return
  }
  const record = await Media.get.ByName(req.params.name);
  let image = {path: null};
  image = await returnOnly(record, [
    "name",
    "path",
    "description",
    "size",
  ]);
  if (!image?.path) {
    res.status(404).send("image not found");
    return
  }
  const result = {
    name: image["name"],
    url: image["path"].replace(PUBLIC, BASEURL),
    description: image.description,
    size: image.size,
  };
  res.status(200).json(result);
});

/**
 * @swagger
 *
 * /media:
 *   get:
 *     summary: retrieve a list of Media records (data not included)
 *     tags:
 *       - media
 *     description: retrieve all Media records
 *     responses:
 *       200:
 *         description: a list of media records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 */
router.get("/", async (req, res, nxt) => {
  console.log(`GET /media`);
  const media = await Media.get.All();
  const visible = await returnOnlyList(media, ["path", "description", "size", "name"]);
  const result = visible
    .map((image) => {
      if (!image.path) return null;
      return {
        name: image["name"],
        url: image["path"].replace(PUBLIC, BASEURL),
        description: image.description,
        size: image.size,
      };
    })
    .filter((n) => n);
  res.status(200).json(result);
});

/**
 * @swagger
 *
 * /media:
 *   post:
 *     summary: upload new media
 *     tags:
 *       - media
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               description:
 *                 type: string
 *               data:
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
router.post("/", upload.single("data"), async (req, res, nxt) => {
  console.log("POST /media/");
  const { filename, description } = req.body;
  const filedata = { ...req.file };
  delete filedata["fieldname"];
  try {
    await Media.post.Create({
      ...filedata,
      description,
      name: filename,
    });
    res.status(201).send(filedata);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
