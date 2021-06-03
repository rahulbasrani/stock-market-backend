const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express();
const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config("./.env");

require("./db/conn");
app.use(express.json());
app.use(cors());
// const User=require('./model/userSchema');
app.use(require("./router/auth"));
const middleware = (req, res, next) => {
  next();
};

app.listen(process.env.PORT || 8000, () => {
  console.log(`server running at port no ${process.env.PORT}`);
});
