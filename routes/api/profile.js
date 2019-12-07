const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const config = require("config");
router.use(express.json({ extended: false }));
// router.use(
//   session({
//     secret: "secretKey",
//     resave: true,
//     saveUninitialized: true
//   })
// );
// router.use(cookieParser());

// Viewing profile route
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });
    if (!user) return res.status(400).send("Invalid Credentials");
    if (!profile) return res.status(400).send("Profile Not Found ");
    if (req.session.userID) {
      return res.render("profile", { user, profile }, (err, html) => {
        if (err) {
          console.error(err);
          return res.status(404).send("HTTP 404 NOT FOUND");
        }
        res.send(html);
      });
    }
    res.render("login", { errors: "Login to view Profile" });
  } catch (error) {
    res.send("Server Error");
  }
});

router.post(
  "/",
  auth,
  [
    check("name", "Username cannot be empty")
      .not()
      .isEmpty(),
    check("email", "Email is required")
      .not()
      .isEmail(),
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
      name,
      email,
      password,
      address
    });
    await newProfile.save();
    alert("Profile Update");
    res.redirect("/profile");
  }
);
module.exports = router;
