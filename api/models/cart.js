const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
    plugins: [{
        pluginName: {type: String, required: true},
        pluginImage: {type: String, required: true},
        IPs: {type: Number, required: true},
        pluginId: {type: String, required: true},
        totalPrice: {type: Number, required: true},
        price: {type: Number, required: true}
    }],
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now()},
})


const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart