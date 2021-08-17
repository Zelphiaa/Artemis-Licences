const mongoose = require('mongoose');
const Schema = mongoose.Schema

const moneyRecaudedSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    money: {type: Number, required: true},
    time: {type: Number, required: true},
})

const Money = mongoose.model("Money", moneyRecaudedSchema)

module.exports = Money