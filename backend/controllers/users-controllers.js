const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user-model");
// const { JWT_TOKEN_KEY } = require("../config");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password").exec(); // Do not include password in data
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  // See if there's any input error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { name, email, password } = req.body;

  // Check if email already present
  let user;
  try {
    user = await User.findOne({ email }).exec();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }
  if (user) {
    return next(
      new HttpError("Email already registered, wanna login instead?", 422)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("Cannot create the user. Please try again.", 500)
    );
  }

  // Create and save new user
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email },
      process.env.JWT_TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  res.status(201).json({ userId: createdUser.id, email, token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email }).exec();
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  if (!identifiedUser) {
    return next(
      new HttpError("No user exists with this email. Signup instead?", 403)
    );
  }

  let isPasswordValid;
  try {
    isPasswordValid = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    return next(new HttpError("Something went wrong. Please try again", 500));
  }

  if (!isPasswordValid) {
    return next(new HttpError("Invalid Password", 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email },
      process.env.JWT_TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(new HttpError(`Error occurred: ${err}`, 500));
  }

  res.json({ userId: identifiedUser.id, email, token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
