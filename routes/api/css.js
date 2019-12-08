const express = require("express");
const router = express.Router();
const path = require("path");
router.get("/index.css", (req, res) => {
  res.sendFile(
    "/views/css/index.css",
    { root: path.join(__dirname, "../../") },
    err => {
      if (err)
        return res.status(err.status).json({ msg: "Error rendering file" });
    }
  );
});

router.get("/login.css", (req, res) => {
  res.sendFile(
    "/views/css/login.css",
    { root: path.join(__dirname, "../../") },
    err => {
      if (err)
        return res.status(err.status).json({ msg: "Error rendering file" });
    }
  );
});

router.get("/profile.css", (req, res) => {
  res.sendFile(
    "/views/css/profile.css",
    { root: path.join(__dirname, "../../") },
    err => {
      if (err)
        return res.status(err.status).json({ msg: "Error rendering file" });
    }
  );
});

router.get("/logout.css", (req, res) => {
  res.sendFile(
    "/views/css/logout.css",
    { root: path.join(__dirname, "../../") },
    err => {
      if (err)
        return res.status(err.status).json({ msg: "Error rendering file" });
    }
  );
});
module.exports = router;
