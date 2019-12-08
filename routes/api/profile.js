const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const config = require("config");
var cookieSession = require("cookie-session");

router.use(express.json({ extended: false }));
router.use(
  cookieSession({
    name: "session",
    keys: ["secretKey"],
    cookie: {
      expiresIn: new Date(Date.now() + 60 * 60 * 1000)
    }
  })
);
// Viewing profile route
router.get("/", async (req, res) => {
  try {
    if (req.session.user === undefined) {
      // User not logged in
      req.session.errors = { msg: "Login to view Profile" };
      return res.redirect("/api/login");
    }
    //const user = await User.findById(req.user.id);
    const user = await User.findOne({ email: req.session.user });
    if (!user) return res.status(400).send("Invalid Credentials");
    const profile = await Profile.findOne({ user: user.id });
    if (!profile) return res.status(400).send("Profile Not Found ");

    return res.render("profile", { user, profile }, (err, html) => {
      if (err) {
        console.error(err);
        return res.status(404).send("HTTP 404 NOT FOUND");
      }
      res.send(html);
    });
    // res.render("login", { errors: "Login to view Profile" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  auth,
  [
    check("name", "Username cannot be empty")
      .not()
      .isEmpty(),
    check("email", "Email is required").isEmail(),
    check("state", "State cannot be empty")
      .not()
      .isEmpty(),
    check("district", "District cannot be empty")
      .not()
      .isEmpty(),
    check("street", "Street cannot be empty")
      .not()
      .isEmpty(),
    check("house_no", "House number cannot be empty")
      .not()
      .isEmpty(),
    check("password", "Password cannot be empty")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      name,
      email,
      password,
      state,
      district,
      street,
      house_no
    } = req.body;
    const address = {
      state,
      district,
      street,
      house_no
    };

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: "Invalid Credentials" });
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return res.status(400).json({ errors: "Invalid Credentials" });
    const newProfile = new Profile({
      user: req.user.id,
      address
    });

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      await newProfile.save();
      return res.send("Profile Updated");
    } else {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { address: newProfile.address },
        { new: true }
      );
      return res.send("Profile Updatedd");
    }
    //window.alert("Profile Update");
    //res.redirect("/profile");
  }
);
module.exports = router;
