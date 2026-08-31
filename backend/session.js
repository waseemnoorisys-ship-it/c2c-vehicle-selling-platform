const express = require("express");
const session = require("express-session");

const app = express();

app.use(session({
  secret: "my-secret",
  resave: false,
  saveUninitialized: false
}));

app.get("/", (req, res) => {
  req.session.user = "John";
  console.log("Session created:", req.sessionID);

  res.send(`Hello ${req.session.user}`);
});

app.listen(3000);
