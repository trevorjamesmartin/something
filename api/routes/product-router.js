const { Router } = require("express");
const Product = require("./product-model");
const router = Router();

// sqlite doesn't support .returning(['name', 'etc'])
// quick filter (things the client wouldn't need to see)
not_visible = ["deleted"];

async function returnVisible(product) {
  if (!product) return {};
  const filtered_copy = product;
  await not_visible.forEach((c) => delete filtered_copy[c]);
  return filtered_copy;
}

async function returnVisibles(products) {
  const filtered_list = await Promise.all(products.map(returnVisible));
  return filtered_list;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The product's ID.
 *           example: 1
 *         name:
 *           type: string
 *           description: The product's name.
 *           example: Jack Herer
 *         description:
 *           type: string
 *           description: A description of the product.
 *           example: about Jack Herer...
 *         image_url:
 *           type: string
 *           description: image location
 *           example: https://images.leafly.com/flower-images/jack-herer.jpg
 *         type:
 *           type: string
 *           description: product type
 *           example: hybrid
 *         tags:
 *           type: string
 *           description: comma separated list of tags describing the product
 *           example: sativa-dominant,creative
 *         format:
 *           type: string
 *           description: product format
 *           example: flower
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NewProduct:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The product name.
 *           example: Northern Lights
 *         description:
 *           type: string
 *           description: A description of the product.
 *           example: about Northern Lights...
 *         image_url:
 *           type: string
 *           description: image location
 *           example: https://images.leafly.com/flower-images/northern-lights.png
 *         type:
 *           type: string
 *           description: product type
 *           example: indica
 *         tags:
 *           type: string
 *           description: comma separated list of tags describing the product
 *           example: indica-dominant,euphoric,relaxing
 *         format:
 *           type: string
 *           description: product format
 *           example: flower
 */

/**
 * @swagger
 * /products/_trash:
 *   get:
 *     summary: retrieve products marked for deletion
 *     tags:
 *       - recycling
 *     description: retrieve a list of products marked for deletion
 *     responses:
 *       200:
 *         description: a list of products marked for deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *
 * /products/_trash/{id}:
 *   get:
 *     summary: retrieve product with {id}
 *     tags:
 *       - recycling
 *     description: retrieve product with {id} (marked for deletion)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: product id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: a list of products marked for deletion
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Product'
 */
router.get(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    console.log(`GET /products/_trash/${id}`);
    const product = await Product.get.Trash.ById(id);
    res.status(200).json(await returnVisible(product));
  } else {
    console.log("GET /products/_trash");
    const products = await Product.get.Trash.All();
    res.status(200).json(await returnVisibles(products));
  }
});

/**
 * @swagger
 *
 * /products/_id/{id}:
 *   get:
 *     summary: retrieve product with {id}
 *     tags:
 *       - products
 *     description: retrieve product with {id}
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: product id
 *         schema:
 *           type: integer
 *
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 */
router.get("/_id/:id", async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    console.log(`GET /products/_id/${id}`);
    res
      .status(200)
      .json({ data: await returnVisible(await Product.get.ById(id)) });
  } else {
    res.status(422).send("id ?");
  }
});

/**
 * @swagger
 *
 * /products/{format}:
 *   get:
 *     summary: retrieve product with {id}
 *     tags:
 *       - products
 *     description: retrieve product with {id}
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         description: product format
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: a list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/:format", async (req, res, nxt) => {
  const { format } = req.params;
  console.log(`GET /products/${format}`);
  const products = await Product.get.Where({ format });
  const result = await returnVisibles(products);
  res.status(200).json({ products: result });
});

/**
 * @swagger
 *
 * /products:
 *   get:
 *     summary: retrieve ALL products
 *     tags:
 *       - products
 *     description: retrieve ALL products
 *     responses:
 *       200:
 *         description: a list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", async (req, res, nxt) => {
  console.log(`GET /products`);
  const products = await Product.get.All();
  const result = await returnVisibles(products);
  res.status(200).json({ products: result });
});

/**
 * @swagger
 *
 * /products:
 *   post:
 *     summary: Create a new Product
 *     tags:
 *       - products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewProduct'
 *     responses:
 *       201:
 *         description: ok, created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.post("/", async (req, res, nxt) => {
  console.log("POST /products/");
  const result = await Product.post.Create(req.body);
  const status = !result?.error ? 201 : 400;
  res.status(status).json(result);
});

/**
 * @swagger
 *
 * /products/_id/{id}:
 *   put:
 *     summary: update product with {id}
 *     tags:
 *       - products
 *     description: modify the record of the Product with {id}
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: product ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewProduct'
 *     responses:
 *       200:
 *         description: Updated
 */
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

/**
 * @swagger
 *
 * /products/_trash/{id}:
 *   put:
 *     summary: put a product in the trash
 *     tags:
 *       - recycling
 *     description: mark product with {id} for deletion
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: product ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/_trash/:id", async (req, res, nxt) => {
  const { id } = req.params;
  if (id) {
    const result = await Product.put.Trash(id);
    console.log("RESULT", result);
    res.status(200).json(result);
  } else {
    res.status(422).send("id ?");
  }
});

/**
 * @swagger
 *
 * /products/_restore/{id}:
 *   put:
 *     summary: remove a product from the trash
 *     tags:
 *       - recycling
 *     description: un-mark product with {id} for deletion
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: product ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/_restore/:id", async (req, res, nxt) => {
  const { id } = req.params;
  console.log('restore', id)
  if (id) {
    const result = await Product.put.Restore(id);
    console.log("RESULT", result);
    res.status(200).json(result);
  } else {
    res.status(422).send("id ?");
  }
});

/**
 * @swagger
 * /products/_trash:
 *   delete:
 *     summary: empty the trashcan
 *     tags:
 *       - recycling
 *     description: remove all products marked for deletion
 *     responses:
 *       200:
 *         description: Trash empty
 * 
 * /products/_trash/{id}:
 *   delete:
 *     summary: delete product with {id}
 *     tags:
 *       - recycling
 *     description: delete product with {id} (marked for deletion)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: product id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete(["/_trash", "/_trash/:id"], async (req, res, nxt) => {
  const { id } = req.params;
  const result = await Product.delete.Trash(id);
  console.log("DELETE ", result)
  res.status(200).json(result);
});

module.exports = router;
