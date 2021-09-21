const { Router } = require("express");
const Product = require("./product-model");

const router = Router();

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

module.exports = router;
