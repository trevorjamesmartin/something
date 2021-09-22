const { Router } = require("express");
const Product = require("./product-model");

const router = Router();

router.get(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    console.log(`GET /_trash/${id}`);
    const product = await Product.getTrashById(id);
    res.status(200).json({ product });
  } else {
    const products = await Product.getTrash();
    res.status(200).json({ products });
    }
});

router.get("/_id/:id", async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    console.log(`GET /products/_id/${id}`);
    const product = await Product.getById(id);
    res.status(200).json({ product });
  } else {
    res.status(422).send("id ?");
  }
});

router.get("/:format", async (req, res, nxt) => {
  const { format } = req.params;
  console.log(`GET /products/${format}`);
  const products = await Product.getWhere({ format });
  res.status(200).json({ products });
});

router.get("/", async (req, res, nxt) => {
  console.log("GET /products");
  const format = ["flower", "oil", "concentrate"];
  res.status(422).send(format.join(", ") + "?");
});

router.post("/", async (req, res, nxt) => {
  console.log("POST /products/");
  const result = await Product.newProduct(req.body);
  const status = !result?.error ? 200 : 400;
  res.status(status).json(result);
});

router.put(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    const result = await Product.trash(id);
    console.log("RESULT", result);
    res.status(200).json(result);
  } else {
    res.status(422).send("id ?");
  }
});

router.delete(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  const result = await Product.emptyTrash(id);
  res.status(200).json(result);
});

module.exports = router;
