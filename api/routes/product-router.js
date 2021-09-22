const { Router } = require("express");
const Product = require("./product-model");

const router = Router();

router.get(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    console.log(`GET /_trash/${id}`);
    const product = await Product.get.Trash.ById(id);
    res.status(200).json({ product });
  } else {
    const products = await Product.get.Trash.All();
    res.status(200).json({ products });
    }
});

router.get("/_id/:id", async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    console.log(`GET /products/_id/${id}`);
    const product = await Product.get.ById(id);
    res.status(200).json({ product });
  } else {
    res.status(422).send("id ?");
  }
});

router.get("/:format", async (req, res, nxt) => {
  const { format } = req.params;
  console.log(`GET /products/${format}`);
  const products = await Product.get.Where({ format });
  res.status(200).json({ products });
});

router.get("/", async (req, res, nxt) => {
  console.log("GET /products");
  const format = ["flower", "oil", "concentrate"];
  res.status(422).send(format.join(", ") + "?");
});

router.post("/", async (req, res, nxt) => {
  console.log("POST /products/");
  const result = await Product.post.Create(req.body);
  const status = !result?.error ? 200 : 400;
  res.status(status).json(result);
});

router.put("/_id/:id", async (req, res, nxt) => {
  const { id } = req.params;
  const number_of_changes = Object.keys(req.body).length;
  if (id && number_of_changes > 0) {
    console.log(`PUT /products/_id/${id}`);
    const result = await Product.put.Update(id, req.body);
    res.status(200).json(result);
  } else {
    res.status(422).send("id ? changes ?");
  }
});

router.put(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    const result = await Product.put.Trash(id);
    console.log("RESULT", result);
    res.status(200).json(result);
  } else {
    res.status(422).send("id ?");
  }
});

router.delete(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  const result = await Product.delete.Trash(id);
  res.status(200).json(result);
});

module.exports = router;
