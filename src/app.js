const express = require('express');
const app = express();
app.disable("x-powered-by");
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

module.exports = app;