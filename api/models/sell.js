const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sellSchema = new Schema({
  userId: { type: Schema.Types.ObjectId,ref: "User", required: true },
  keyId: { type: Schema.Types.ObjectId,ref: "Key", required: true },
  IPs: { type: Number, required: true },
  time: { type: Number, required: true }
});

//Convet to model
const Sell = mongoose.model("Sell", sellSchema);

module.exports = Sell;
