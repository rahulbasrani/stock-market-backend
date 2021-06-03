const mongoose = require("mongoose");

const Db = process.env.DB;
mongoose
  .connect(Db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection to db is successful");
  })
  .catch((err) => console.log("no connection"));