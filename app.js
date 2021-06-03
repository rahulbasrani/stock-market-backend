const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const port = process.env.PORT || 8000;

dotenv.config("./.env");

require("./db/conn");
app.use(express.json());
app.use(cors());
app.use(require("./router/auth"));

app.listen(port, () => {
  console.log(`server running at port no ${port}`);
});
