const express = require("express");
const app = express();
const fs = require("fs");
const pug = require("pug");
const db = require("./config/db");
const Usage = require("./models/Usage");
const { check, validationResult } = require("express-validator");
app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bcrypt = require("bcryptjs");

db();
app.use("/api/user", require("./routes/api/user"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/dashboard", async (req, res) => {
  try {
    const dbdata = await Usage.find();

    res.render(
      "login",
      {
        title: "WebPage",
        data: dbdata
      },
      (err, html) => {
        if (err)
          return res.status(404).json({ msg: "Unexpected Error Occured" });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.get("/css/login.css", (req, res) => {
  res.sendFile("./views/css/login.css", { root: __dirname }, err => {
    if (err)
      return res.status(err.status).json({ msg: "Error rendering file" });
  });
});

app.get("/css/index.css", (req, res) => {
  res.sendFile("./views/css/index.css", { root: __dirname }, err => {
    if (err)
      return res.status(err.status).json({ msg: "Error rendering file" });
  });
});

app.post(
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
app.post(
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
    // res.redirect("/dashboard");
    const data = await Usage.find();
    res.render("index", { data: data });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
