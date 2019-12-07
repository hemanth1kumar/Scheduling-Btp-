const jwt = require("jsonwebtoken");
const config = require("config");
const session = require("express-session");

const auth = async (req, res, next) => {
  try {
    let token = req.header("token");
    token = req.session.token;
    token = req.query.token;
    /// console.log(token);

    if (!token) return res.status(400).send("Not Authorized");
    const secretKey = config.get("jwtToken");
    const decoded = await jwt.verify(token, secretKey);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(400).send("No Authorization");
  }
};
module.exports = auth;
