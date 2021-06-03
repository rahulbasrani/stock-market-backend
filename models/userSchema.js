const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  verification_info: [
    {
      isVerified: {
        type: Boolean,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
  reset_info: [
    {
      isReset: {
        type: Boolean,
        required: true,
      },
      token: {
        type: String,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign(
      { _id: this._id },
      "thisismernwebsiteforstockmarketrepresentation"
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.updatePassword = async function (password) {
  try {
    this.reset_info[0].isReset = true;
    this.password = password;
    this.confirmPassword = password;
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.generateVerificationToken = async function () {
  try {
    let token = jwt.sign(
      { email: this.email },
      "thisismernwebsiteforstockmarketrepresentation"
    );
    this.verification_info = this.verification_info.concat({
      isVerified: false,
      token: token,
    });
    this.reset_info = this.reset_info.concat({
      isReset: false,
      token: "",
    });

    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.updateVerification = async function () {
  try {
    let token = jwt.sign(
      { email: this.email },
      "thisismernwebsiteforstockmarketrepresentation"
    );
    this.verification_info[0].isVerified = true;
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.resendEmailToken = async function () {
  try {
    let token = jwt.sign(
      { email: this.email },
      "thisismernwebsiteforstockmarketrepresentation"
    );
    this.verification_info[0].token = token;
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.forgotPasswordToken = async function () {
  try {
    let token = jwt.sign(
      { email: this.email },
      "thisismernwebsiteforstockmarketrepresentation"
    );
    this.reset_info[0].token = token;
    this.reset_info[0].isReset = false;
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("USER", userSchema);

module.exports = User;
