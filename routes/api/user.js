const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const Usage = require("../../models/Usage");
router.use(express.urlencoded({ extended: true }));

// User Registration
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Email is required")
      .not()
      .isEmpty(),
    check("password", "Password is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array() });
    const { name, email, password } = req.body;
    try {
      const newUser = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);

      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();
      res.send("User registration successfull");
    } catch (error) {
      console.error(error.message);
      res.setatus(500).send("Server Error");
    }
  }
);

// POST api/user/login
// Login for users
// Public
router.post(
  "/login",
  [
    check("email", "Email is required")
      .not()
      .isEmpty(),
    check("password", "Password is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.render("login", { msg: "", errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.render("login", { msg: "", errors: "Invalid Credentials" });
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return res.render("login", { msg: "", errors: "Invalid Credentials" });
    const data = await Usage.find();
    res.redirect("/dashboard");
    //res.render("index", { data: data });
  }
);

module.exports = router;
