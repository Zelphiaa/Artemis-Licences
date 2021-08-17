const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema

const roles = {
    values: ["ADMIN", "USER", "SUB-ADMIN"],
    message: '{VALUE} not a valid role'
}

//SCHEMA
const userSchema = new Schema({
    name: {type: String, required: [true, "Name is required"], unique: true},
    email: {type: String, required: [true, "Email is required"], unique: true},
    password: {type: String, required: [true, "Password is required"]},
    rol: {type:String, default: "USER", enum: roles},
    active: {type: Boolean, default: false},
    secretToken: {type: String},
    image: {type: String, default: 'https://minotar.net/avatar/'},
    keys: [{type: Schema.Types.ObjectId, ref: 'Key'}],
    cart: {type: Schema.Types.ObjectId, ref: 'Cart'},
    tokenPassword: {type:String}
})

//VALIDATOR
userSchema.plugin(uniqueValidator, {message: 'Error, {PATH} already exists'})
userSchema.methods.toJSON = function (){
    var obj = this.toObject();
    delete obj.password
    return obj
}

const User = mongoose.model('User', userSchema)

module.exports = User
