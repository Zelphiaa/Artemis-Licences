const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    headline: String,
    body: String,
    rating: Number,
    pluginId: {type: Schema.Types.ObjectId, ref: 'Product'},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    userName: {type: String, ref: 'User'},
    time: {type: Number}
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review