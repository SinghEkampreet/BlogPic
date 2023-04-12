const { MongoClient } = require("mongodb");

const { MONGO_DB_URI } = require("../config");
const HttpError = require("../models/http-error");

const getPackage = async (req, res, next) => {
  const client = new MongoClient(MONGO_DB_URI);
  let result;
  try {
    await client.connect();
    const collection = await client.db("demo").collection("packages");
    result = await collection.find().toArray();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  } finally {
    client.close();
  }

  res.json({ packages: result });
};

const createPackage = async (req, res, next) => {
  const package = {
    name: req.body.name,
    price: req.body.price,
  };

  const client = new MongoClient(MONGO_DB_URI);
  let result;
  try {
    await client.connect();
    const collection = await client.db("demo").collection("packages");
    result = await collection.insertOne(package);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  } finally {
    client.close();
  }

  res.json({ message: result });
};

exports.getPackage = getPackage;
exports.createPackage = createPackage;
