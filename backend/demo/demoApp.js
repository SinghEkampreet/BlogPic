const express = require("express");
const bodyParser = require("body-parser");

const { createPackage, getPackage } = require("./MongooseDemoPackage");

const app = express();

app.use(bodyParser.json());

app.get("/demo/api/package/", getPackage);

app.post("/demo/api/package/", createPackage);

app.use((err, req, res, next) => {
  if (res.headerSent) {
    next(err);
  }
  res
    .status(err.code || 500)
    .json({ message: error.message || "An unexpected error occurred!" });
});

app.listen(6000);
