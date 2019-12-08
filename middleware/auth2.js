var cookieSession = require("cookie-session");
const express = require("express");
const app = express();
app.use(
  cookieSession({
    name: "session",
    keys: ["secretKey"],
    cookie: {
      expiresIn: new Date(Date.now() + 60 * 60 * 1000)
    }
  })
);

module.exports = async (req, res, next) => {
  // const user = req.session.user;
  if (req.session.user === undefined) {
    // User not logged in
    res.redirect("/api/login");
  }
  next();
};
