const path = require('path');

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const api = express();
const productRouter = require('./routes/product-router');

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";

api.set('views', path.join(__dirname, "public"));
api.set('view engine', 'html');

api.use(helmet());
api.use(cors());
api.use(express.json());

// API routes
api.use("/products", productRouter);

// html route
api.use(express.static(path.join(__dirname, 'public')));

api.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Content-Security-Policy": "default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://www.google.com",
        "X-Content-Security-Policy": "default-src *",
        "X-WebKit-CSP": "default-src *"
    })
    next();
});

// NOTE: in this set, 404s end up rendering the homepage.
api.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'something-else.html'));
});

// serve it up
api.listen(PORT, HOST, () => {
  console.log(`listening @ http://${HOST}:${PORT}`);
});
