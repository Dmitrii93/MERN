const { body } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
exports.registerValidators = [
  body("email")
    .isEmail()
    .withMessage("Incorrect email")
    .custom(async (value, { req }) => {
      try {
        const candidate = await User.findOne({ email: value });
        if (candidate) {
          return Promise.reject("Email is already in use");
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body("password", "password needs to be at least 6 characters").isLength({ min: 6, max: 56 }).isAlphanumeric().trim(),
  body("conpassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("passwords are not equal");
      }
      return true;
    })
    .trim(),
  body("name").isLength({ min: 2 }).withMessage("name needs to be at least 2 characters").trim(),
];
exports.loginValidators = [
  body("email")
    .isEmail()
    .withMessage("Incorrect email")
    .custom(async (value, { req }) => {
      try {
        const candidate = await User.findOne({ email: value });
        if (!candidate) {
          return Promise.reject("No such Email");
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body("password", "password needs to be at least 6 characters")
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim()
    .custom(async (value, { req }) => {
      try {
        const candidate = await User.findOne({ email: req.body.email });
        const areSame = await bcrypt.compare(value, candidate.password);
        if (!areSame) {
          return Promise.reject("Password is incorrect");
        }
      } catch (e) {
        console.log(e);
      }
    }),
];
exports.courseValidators = [
  body("title").isLength({ min: 3 }).withMessage("Title needs to be at least 3 characters").trim(),
  body("price").isNumeric().withMessage("Price needs to be a number"),
  body("image", "Enter correct image's URL ").isURL(),
];
