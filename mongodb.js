
// NOT WORKKING RIGHT NOW

const mongoose = require('mongoose')

// Hidden file .env
const dotenv = require('dotenv')
dotenv.config()

// Database connection
const database = (module.exports = () => {
    mongoose
        .connect(process.env.DB_URI, {
            dbName: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            pass: process.env.DB_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        .then(() => {
            console.log('database is workingg')
        })
        .catch((err) => console.log(err))
})

database()

// const loginSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },

//     username: {
//         type: String,
//         required: true
//     },

//     email: {
//         type: String,
//         required: true
//     },

//     password: {
//         type: String,
//         required: true
//     }
// })

const collection = new mongoose.Model('signupCollection')

module.exports = collection
