const express = require("express");
const app = express();
const fs = require("fs");
const pug = require("pug");
const path = require("path");
const db = require("./config/db");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// app.use(
//   session({
//     secret: "secretKey",
//     cookie: {},
//     resave: true,
//     saveUninitialized: true
//   })
// );
// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./routes/api/home"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/css", require("./routes/api/css"));

// Connecing to DB
db();

// app.use("/", (req, res, next) => {
//   console.log(req.url + ", " + req.method);
//   next();
// });

app.get("/", (req, res) => {
  res.redirect("/api/login");
});
app.get("/data", (req, res) => {
  res.send("Data Received");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
