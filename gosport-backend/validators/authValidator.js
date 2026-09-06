const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

const emailRule = body("email").isEmail().withMessage("email is not valid");
const passwordRule = body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters");

const registerValidator = [emailRule, validate];

const loginValidator = [emailRule, validate];

const resendVerificationValidator = [emailRule, validate];

const forgotPasswordValidator = [emailRule, validate];

const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is missing"),
  passwordRule,
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
