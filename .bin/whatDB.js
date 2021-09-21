#!/bin/env node
const path = require("path");
const { exit, argv } = require("process");
const filename = argv.slice(2).join(" ");
if (!filename) {
    console.log('knexfile ?')
    exit(0)
}
const knexfile = require(path.join(process.cwd(), filename));
console.log(knexfile.development.connection.filename.slice(3));
