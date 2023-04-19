const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

// Middleware placed to catch any unsupported route
app.use((req, res, next) => {
  next(new HttpError("Could not find this route", 404));
});

// Express's default error handling middleware
app.use((error, req, res, next) => {
  // multer adds this file property to req object
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err)); // Deletes uploaded file if err
  }

  // Checks if a response has been sent yet, as you can only send one res per req
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500) //500 stands for server error
    .json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-gkuyky0-shard-00-00.0ekr6pl.mongodb.net:27017,ac-gkuyky0-shard-00-01.0ekr6pl.mongodb.net:27017,ac-gkuyky0-shard-00-02.0ekr6pl.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-vsi3ki-shard-0&authSource=admin&retryWrites=true&w=majority`
  )
  .then(
    () =>
      app.listen(process.env.PORT || 5000) &&
      console.log(`Server listening at ${process.env.PORT || 5000}`)
  )
  .catch((err) => console.log(err));
