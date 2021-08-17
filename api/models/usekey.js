const mongoose = require('mongoose');
const Schema = mongoose.Schema

const keyUseSchema = new Schema({
    keyId: {type: String, required: true},
    useIPs: {type: Number},
    totalIPs: {type: Number},
    time: {type: Number}
})

const KeyUse = mongoose.model('KeyUse', keyUseSchema)

module.exports = KeyUse