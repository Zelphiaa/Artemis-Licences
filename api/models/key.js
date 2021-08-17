const mongoose = require('mongoose');
const Schema = mongoose.Schema
const uniqueValidator = require("mongoose-unique-validator")

const keySchema = new Schema({
    key: {type: String, required: true, unique: true},
    IPs: {type: Number, required: true},
    useIPs: {type: Number, default: 0},
    active: {type: Boolean, default: true},
    userId: {type: String, required: true},
    selected: {type: Boolean, default:false},
    pluginName:{type: String},
    pluginId: {type: String, required: true},
    review: {type: Boolean, default: false}
})

//VALIDATOR
keySchema.plugin(uniqueValidator, {message: "Error, the key already exists"})
const Key = mongoose.model("Key", keySchema)

module.exports = Key