const fs = require("fs");

//No need to import express here
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../utils/location");
const Place = require("../models/place-model");
const User = require("../models/user-model");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    // places = await Place.find({ creator: userId }).exec();
    user = await User.findById(userId).populate("places");
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user!", 404));
  }

  if (!user.places || user.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id!", 404)
    );
  }
  res.json({
    places: user.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    address,
    location: coordinates,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId).exec();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  if (!user) {
    return next(
      new HttpError(`Invalid creator Id, place cannot be created`, 404)
    );
  }

  // Make sure you have the collections in DB before running this script,
  // else transaction may fail
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess }); // Pass in the session
    // This push is a mongoose specific method which maintains the connection with user
    // and only save the _id as reference, not the whole object
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  res
    .status(201) //standard code for sent data successfully added on the server
    .json({ place: createdPlace.toObject({ getters: true }) });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }

  place.title = title || place.title;
  place.description = description || place.description;

  try {
    place.save();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) }); //Not 201 response
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    // populate gives us the full object refered in that property
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError(`Error Occurred: ${err}`, 500));
  }

  if (!place) {
    return next(new HttpError(`Did not find place to delete`, 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this place", 401));
  }

  const imageUrl = place.image;

  try {
    const sess = await mongoose.startSession();
    await sess.startTransaction();
    await Place.deleteOne(place, { session: sess });
    place.creator.places.pull(place); // special method to delete the reference
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError(`Error Occurred: ${err}`, 500));
  }

  fs.unlink(imageUrl, (err) => console.log(err));

  if (place.deletedCount === 0) {
    return next(
      new HttpError(`The provided id did not correspond to any place`, 500)
    );
  }

  res.json({ message: "Place removed with provided id." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
