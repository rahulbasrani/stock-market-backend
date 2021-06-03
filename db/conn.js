const mongoose = require("mongoose");

const Db =
  "mongodb+srv://tester:test@12345@cluster0.32gff.mongodb.net/stocks?retryWrites=true&w=majority";
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
