const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        minLenght: 5
    }
})

module.exports = mongoose.model('UserModel', userSchema)
