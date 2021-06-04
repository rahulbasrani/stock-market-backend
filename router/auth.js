const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const nodemailer = require("nodemailer");

require("../db/conn");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_SENDER_PASSWORD,
  },
});

const User = require("../models/userSchema");

router.get("/", (req, res) => {
  res.send("Hello world from the server router js");
});

let token;

router.post("/register", async (req, res) => {
  const { name, email, company, password, confirmPassword } = req.body;
  if (!name || !email || !company || !confirmPassword || !password) {
    return res.status(422).json({ error: "PLZ fill all fields properly" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "Email already exist" });
    } else {
      const user = new User({
        name,
        email,
        company,
        password,
        confirmPassword,
      });
      const tokenSignup = await user.generateVerificationToken();
      const url = `https://stock-market-rahulbasrani.herokuapp.com/email-authentication?token=${tokenSignup}&email=${email}`;
      let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: `${email}`,
        subject: "Confirm Email",
        html: `<h3>Please click this link to comnfirm your mail</h3><br/><a href=${url}><div style="text-decoration:none; padding:10px 20px;background:#54FA4E; width:200px; box-sizing:border-box; color:black; font-weight:600; ">Confirm your mail<div></a>`,
      };

      transporter
        .sendMail(mailOptions)
        .then(function (response) {
          console.log("Email sent");
        })
        .catch(function (error) {
          console.log("Error: ", error);
        });
      await user.save();

      res.status(201).json({
        message:
          "user registered successfully, go to your mail box to verify your email",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Plz fill the data" });
    }

    const userLogin = await User.findOne({ email: email });
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);

      if (!isMatch) {
        res.status(400).json({ error: "Invalid credentials" });
      } else {
        const isVerified = userLogin.verification_info[0].isVerified;
        if (isVerified) {
          token = await userLogin.generateAuthToken();
          res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true,
          });
          res.status(201).send(req.rootUser);
        } else {
          const tokenSignup = await userLogin.generateVerificationToken();
          const url = `https://stock-market-rahulbasrani.herokuapp.com/email-authentication?token=${tokenSignup}&email=${email}`;
          let mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: `${email}`,
            subject: "Confirm Email",
            html: `<h3>Please click this link to comnfirm your mail</h3><br/><a href=${url}><div style="text-decoration:none; padding:10px 20px;background:#54FA4E; width:200px; box-sizing:border-box; color:black; font-weight:600; ">Confirm your mail<div></a>`,
          };

          transporter
            .sendMail(mailOptions)
            .then(function (response) {
              console.log("Email sent");
            })
            .catch(function (error) {
              console.log("Error: ", error);
            });
          res.status(401).json({ message: "check your mailbox" });
        }
      }
    } else {
      res.status(400).json({ message: "No such user" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/email_verify", async (req, res) => {
  try {
    const { email, token } = req.body;

    const userVerify = await User.findOne({ email: email });
    if (userVerify) {
      const tokens = userVerify.verification_info[0].token;
      if (tokens == token) {
        await userVerify.updateVerification();
        res.status(200).json("email verified, go to login");
      } else {
        res.status(422).json("invalid token entered");
      }
    } else {
      res.status.apply(400).json({ message: "No such user" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/resend_email", async (req, res) => {
  try {
    const { email } = req.body;

    const userVerify = await User.findOne({ email: email });
    if (userVerify) {
      const updatedToken = await userVerify.resendEmailToken();
      const url = `https://stock-market-rahulbasrani.herokuapp.com/email-authentication?token=${updatedToken}&email=${email}`;
      let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: `${email}`,
        subject: "Confirm Email",
        html: `<h3>Please click this link to confirm your mail</h3><br/><a href=${url}><div style="text-decoration:none; padding:10px 20px;background:#54FA4E; width:200px; box-sizing:border-box; color:black; font-weight:600; ">Confirm your mail<div></a>`,
      };

      transporter
        .sendMail(mailOptions)
        .then(function (response) {
          console.log("Email sent");
        })
        .catch(function (error) {
          console.log("Error: ", error);
        });
      res.status(200).json("Email sent go to mailbox to verify your email");
    } else {
      res.status.apply(400).json({ message: "No such user" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/forgot_password", async (req, res) => {
  try {
    const { email } = req.body;

    const userVerify = await User.findOne({ email: email });
    if (userVerify) {
      const updatedToken = await userVerify.forgotPasswordToken();

      const url = `https://stock-market-rahulbasrani.herokuapp.com/reset-password?token=${updatedToken}&email=${email}`;
      let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: `${email}`,
        subject: "Reset Password",
        html: `<h3>Please click this link to reset password</h3><br/><a href=${url}><div style="text-decoration:none; padding:10px 20px;background:#54FA4E; width:250px; box-sizing:border-box; color:black; font-weight:600; ">Click to Reset your Password<div></a>`,
      };

      transporter
        .sendMail(mailOptions)
        .then(function (response) {
          console.log("Email sent");
        })
        .catch(function (error) {
          console.log("Error: ", error);
        });
      res.status(201).json("password reset link sent successfully");
    } else {
      res.status.apply(400).json({ message: "No such user" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/reset_password", async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const userVerify = await User.findOne({ email: email });
    const resetToken = userVerify.reset_info[0].token;
    const isMatch = await bcrypt.compare(password, userVerify.password);
    if (!isMatch) {
      if (resetToken == token) {
        await userVerify.updatePassword(password);
        res.status(201).json("Your password has been reset successfully");
      } else {
        res.status(422).json("invalid token provided");
      }
    } else {
      res.status(401).json("password can't be same");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
