// standard library
const path = require("path");
const compression = require("compression");

// 3rd party
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const api = express();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// local
const productRouter = require("./routes/product-router");
const mediaRouter = require("./routes/media-router");

api.use(compression()); // compress page content to reduce size

// swagger
const openapiSpecification = swaggerJsdoc({
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Something API",
      version: "1.0.0",
      description: "made with Express.",
      license: {
        name: "Licensed Under MIT",
        url: "https://github.com/trevorjamesmartin/something/blob/main/LICENSE",
      },
      contact: {
        name: "Source",
        url: "https://github.com/trevorjamesmartin/something",
      },
    },
    servers: [
      { url: "http://localhost:8080/api", description: "development server" },
      { url: `${process.env.API_URL}`, description: "API server" },
    ],
  },
  apis: ["./rest/routes/*.js"], // files containing annotations as above
});
api.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// the view engine is key to rendering your SPA
api.set("views", path.join(__dirname, "public"));
api.set("view engine", "html");

// middlewares
api.use(helmet()); // optional
api.use(cors()); // necessary
api.use(express.json()); // built-in option

// API routes
api.use("/api/products", productRouter);
api.use("/api/media", mediaRouter);
// ...

// HTML renders SPA from here, (app-wide cache settings)
api.use(express.static(path.join(__dirname, "public")));

api.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Content-Security-Policy":
      "default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://www.google.com",
    "X-Content-Security-Policy": "default-src *",
    "X-WebKit-CSP": "default-src *",
  });
  next();
});

// NOTE: in this set, 404s may end up rendering the homepage.
api.use(function (req, res) {
  res.sendFile(path.join(__dirname, "public", "something-else.html"));
});

module.exports = { api }
