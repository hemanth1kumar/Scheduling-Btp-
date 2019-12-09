const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const auth2 = require("../../middleware/auth2");
const auth = require("../../middleware/auth");
var cookieSession = require("cookie-session");
const User = require("../../models/User");
const Usage = require("../../models/Usage");
router.use(
  cookieSession({
    name: "session",
    keys: ["secretKey"],
    cookie: {
      expiresIn: new Date(Date.now() + 60 * 60 * 1000)
    }
  })
);
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
    if (req.session.user) return res.redirect("/api/dashboard");
    // if (req.session.errors)
    //   return res.render("login", { errors: req.session.errors });
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.render("login", { errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.render("login", { errors: "Invalid Credentials" });
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.render("login", { errors: "Invalid Credentials" });
    const payload = {
      user: {
        id: user.id
      }
    };

    // Token Generation
    const token = jwt.sign(payload, config.get("jwtToken"), {
      expiresIn: 3600
    });
    res.set("token", token);
    req.session.user = email;
    //res.redirect(`/dashboard?token=${token}`);
    res.redirect("/api/dashboard");
  }
);

// Dashboard Route
router.get("/dashboard", async (req, res) => {
  try {
    if (req.session.user === undefined) {
      // User not logged in
      //return res.redirect("/api/login");
      const errors = {
        msg: "Login to view Dashboard !"
      };
      req.session.errors = errors;
      return res.redirect("/api/login");
      //return res.render("login", { errors });
    }
    const curUser = await User.findOne({ email: req.session.user });
    //console.log(curUser.name);
    const dbdata = await Usage.find();
    const reqData = dbdata.map(row => {
      if (row.user == curUser.id) return row;
    });
    // reqData.map(data => {
    //   if (data) console.log(data.name);
    // });
    res.render(
      "index",
      {
        title: "WebPage",
        data: reqData,
        user: curUser.name,
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

// Insertion through parameter
// router.post("/insertdata", async (req, res) => {
//   try {
//     const { name, time, power } = req.query;
//     const newEntry = new Usage({
//       name,
//       power,
//       time
//     });
//     if (name) newEntry.name = name;
//     if (time) newEntry.time = time;
//     if (power) newEntry.power = power;

//     if (!name || !power || !time)
//       return res.status(400).send("No data to insert");
//     await newEntry.save();
//     res.json({ msg: "Data inserted into MongoDB" });
//   } catch (error) {
//     res.status(500).send("Server Error");
//   }
// });

router.all(
  "/pi/login",
  [
    check("email", "Email is required")
      .not()
      .isEmpty(),
    check("password", "Password is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      const msg = errors.array().map(error => error.msg);
      if (!errors.isEmpty()) return res.json({ msg: msg });
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.render("login", { errors: "Invalid Credentials" });
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return res.render("login", { errors: "Invalid Credentials" });
      const payload = {
        user: {
          id: user.id
        }
      };
      // Token Generation
      const token = jwt.sign(payload, config.get("jwtToken"), {
        expiresIn: 3600
      });
      res.send(token);
    } catch (error) {
      console.log(error.msg);
      res.status(5000).send("Server Error");
    }
  }
);

// Insertion through parameter
router.post("/insertdata", async (req, res) => {
  try {
    const { token, name, time, power, cost } = req.body;
    //console.log(token);
    if (!token) return res.status(400).send("Not Authorised");
    const decoded = jwt.verify(token, config.get("jwtToken"));
    const user = await User.findById(decoded.user.id);
    // console.log(user.name);
    const newEntry = new Usage({
      user: user.id,
      name,
      power,
      time,
      cost
    });
    if (name) newEntry.name = name;
    if (time) newEntry.time = time;
    if (power) newEntry.power = power;
    if (cost) newEntry.cost = cost;

    if (!name || !power || !time || !cost)
      return res.status(400).send("Insufficient Data");
    await newEntry.save();
    res.json({ msg: "Data inserted into MongoDB" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// Insert Data Route
// router.post(
//   "/insertdata",
//   [
//     check("name", "Name is required")
//       .not()
//       .isEmpty(),
//     check("time", "Time is required")
//       .not()
//       .isEmpty(),
//     check("power", "Power is required")
//       .not()
//       .isEmpty()
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty())
//       return res.status(400).json({ errors: errors.array() });
//     try {
//       const { name, time, power } = req.body;
//       const newEntry = new Usage({
//         name,
//         time,
//         power
//       });
//       await newEntry.save();
//       res.json({ msg: "Data inserted into MongoDB" });
//     } catch (error) {
//       console.error(error.message);
//       require.status(500).send("Server Error");
//     }
//   }
// );

// favicon route
router.get("/favicon.ico", (req, res) => {
  res.sendFile("views/images/icon.png", {
    root: path.join(__dirname, "../../")
  });
});

// Ending Session
router.get("/logout", (req, res) => {
  req.session = null;
  res.render("logout");
});
module.exports = router;
