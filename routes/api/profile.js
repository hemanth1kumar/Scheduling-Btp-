const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const auth = require("../../middleware/auth");

router.use(express.json({ extended: false }));
// router.use(
//   session({
//     secret: "secretKey",
//     resave: true,
//     saveUninitialized: true
//   })
// );
// router.use(cookieParser());

// // Viewing profile route
// router.get("/", auth, async (req, res) => {
//   if (req.session.userID) {
//     return res.render("profile", (err, html) => {
//       if (err) {
//         console.error(err);
//         return res.status(404).send("HTTP 404 NOT FOUND");
//       }
//       res.send(html);
//     });
//   }
//   res.render("login", { errors: "Login to view Profile" });
// });
router.get("profile", (req, res) => {
  res.send("profile !!");
});
router.post("/profile", async (req, res) => {
  // Checking input
  res.send("profile updated");
});
module.exports = router;
