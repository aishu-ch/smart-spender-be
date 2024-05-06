const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/user");

module.exports = {
  create,
  login,
  checkToken,
  findAll,
  findByUsername,
};

function checkToken(req, res) {
  console.log("req.user", req.user);
  res.json(req.exp);
}

async function login(req, res) {
  try {
    const lowercaseUsername = req.body.username.toLowerCase();
    const user = await User.findOne({ username: lowercaseUsername });
    if (!user) throw new Error();
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new Error();
    const token = createJWT(user);
    res.json(token);
  } catch (err) {
    res.status(400).json("Bad Credentials");
  }
}

async function create(req, res) {
  try {
    console.log("create route is hit");
    req.body.username = req.body.username.toLowerCase(); // format username to lowercase
    req.body.username = req.body.username.replace(" ", ""); // replace spaces in username
    req.body.email = req.body.email.toLowerCase(); // format email to lowercase
    const user = await User.create(req.body);
    const token = createJWT(user);
    // The token is a string, but yes, we can
    // res.json a string
    res.json(token);
  } catch (err) {
    console.log("debug", err);
    res.status(400).json(err);
  }
}

/*-- Helper Functions --*/
function createJWT(user) {
  return jwt.sign(
    // extra data for the payload
    { user },
    process.env.SECRET,
    { expiresIn: "24h" }
  );
}

async function findAll(req, res) {
  try {
      const users = await User.find({}); 

      return res.status(201).json(users);
  } catch (error) {
      return res.status(500).json({ error: error.message })
  }
}

async function findByUsername(req, res) {
  try {
      const { username } = req.params;
      const user = await User.find( { username: username });;
      
      return res.status(201).json({ user });
  } catch (error) {
      return res.status(500).json({ error: error.message })
  }
}