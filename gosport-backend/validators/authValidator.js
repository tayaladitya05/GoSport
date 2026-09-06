const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

const emailRule = body("email").isEmail().withMessage("email is not valid");

const registerValidator = [emailRule, validate];
const loginValidator = [emailRule, validate];
const resendVerificationValidator = [emailRule, validate];

module.exports = {
  registerValidator,
  loginValidator,
  resendVerificationValidator,
};
