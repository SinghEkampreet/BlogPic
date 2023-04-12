const mongoose = require("mongoose");

const Package = require("./demoSchema");
const { MONGO_DB_URI } = require("../config");

mongoose
  .connect(MONGO_DB_URI)
  .then(() => console.log("Connected to the database!"))
  .catch((err) => console.log(`Connection failed: \n${err}`));

const createPackage = async (req, res, next) => {
  const createdPackage = new Package({
    name: req.body.name,
    price: req.body.price,
  });
  // console.log(createdPackage) will print object containing name, price and a unique _id property that mongodb creates if not already present. mongoose creates it for us
  // console.log(typeof createdPackage.id) returns string (converted by mongoose)
  // console.log(typeof createdPackage._id) returns object (default _id property) which needs to be converted in vanilla MongoDB to get the real value
  const result = await createdPackage.save();
  res.json(result);
};

const getPackage = async (req, res, next) => {
  const result = await Package.find().exec();
  res.json(result);
};

exports.createPackage = createPackage;
exports.getPackage = getPackage;
