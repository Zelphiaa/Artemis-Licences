//REQUIRES
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv").config();

//INSTANCES
const app = express();

//express config
app.use(fileUpload());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

//ROUTES
var io;
var getIoInstance = () => {
  return io;
};

//LISTENER PORT
const server = app.listen(3001, () => {
  console.log("API server listening on port " + 3001);
});

const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri =
  "mongodb://localhost/licences";

var options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  authSource: "admin"
};

try {
  mongoose.connect(uri, options).then(
    () => {
      console.log("\n");
      console.log("*******************************".green);
      console.log("✔ Mongo Successfully Connected!".green);
      console.log("*******************************".green);
      console.log("\n");
      global.check_user_admin();
    },
    err => {
      console.log("\n");
      console.log("*******************************".red);
      console.log("    Mongo Connection Failed    ".red);
      console.log("*******************************".red);
      console.log("\n");
      console.log(err);
    }
  );
} catch (error) {
  console.log("ERROR CONNECTION MONGODB");
  console.log(error.red);
}

io = require("socket.io")(server);

const keys = require("./routes/keys")(io);
app.use("/api", require("./routes/users"));
app.use("/api", keys);
app.use("/api", require("./routes/sells"));
app.use("/api", require("./routes/categories"));
app.use("/api", require("./routes/plugins"));
app.use("/api", require("./routes/reviews"));
app.use("/api", require("./routes/cart"));
app.use("/api", require("./routes/moneyrecauded"));

app.set("socketio", io);

module.exports = app
