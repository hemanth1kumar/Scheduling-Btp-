const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const session = require("express-session");
// router.use(
//   session({
//     secret: "secretKey",
//     resave: true,
//     saveUninitialized: true
//   })
// );
//Home Route
// router.all("/", (req, res) => {
//   if (req.session.userID) {
//     return res.redirect("/dashboard");
//     //return res.redirect("/dashboard");
//   }
//   res.redirect("/login");
// });

// Login Route
router.all(
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
      return res.render("login", { errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.render("login", { errors: "Invalid Credentials" });
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.render("login", { errors: "Invalid Credentials" });
    req.session.userID = email;

    const payload = {
      user: {
        id: user.id
      }
    };

    // Token Generation
    const token = jwt.sign(
      payload,
      config.get("jwtToken"),
      { expiresIn: 3600 }
      // (err, token) => {
      //   if (err) return res.status(500).send("Token Error");

      //   res.cookie("token", token, {
      //     expires: new Date(Date.now + 900000),
      //     httpOnly: true
      //   });
      // console.log(token);
      // req.session.token = token;
      //}
    );
    res.set("token", token);
    res.redirect(`/dashboard?token=${token}`);
  }
);

// Dashboard Route
router.get("/dashboard", auth, async (req, res) => {
  try {
    const dbdata = await Usage.find();
    res.render(
      "index",
      {
        title: "WebPage",
        data: dbdata,
        token: req.query.token
      },
      (err, html) => {
        if (err) {
          console.error(err);
          return res.status(404).json({ msg: "Unexpected Error Occured" });
        }
        res.send(html);
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Insert Data Route
router.post(
  "/insertdata",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("time", "Time is required")
      .not()
      .isEmpty(),
    check("power", "Power is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { name, time, power } = req.body;
      const newEntry = new Usage({
        name,
        time,
        power
      });
      await newEntry.save();
      res.json({ msg: "Data inserted into MongoDB" });
    } catch (error) {
      console.error(error.message);
      require.status(500).send("Server Error");
    }
  }
);

// favicon route
router.get("/favicon.ico", (req, res) => {
  res.sendFile("views/images/icon.png", {
    root: path.join(__dirname, "../../")
  });
});
module.exports = router;
