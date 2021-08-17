const mongoose = require('mongoose')
const Schema = mongoose.Schema

const testKey = new Schema({
    pluginName: {type:String, required: true},
    pluginId: {type:String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    approved: {type: Boolean, default: false},
    rejected: {type: Boolean, default: false},
    date: {type: Number, required: true},
    admRejected: {type: Schema.Types.ObjectId, ref: "User"}
})

const Test = mongoose.model('Test', testKey)

module.exports = Test