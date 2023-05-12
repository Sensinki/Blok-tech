// defineren
const express = require('express')
const mongoose = require('mongoose')
const { engine } = require('express-handlebars')

const app = express()
const PORT = process.env.PORT || 3000

// Hidden file .env
const dotenv = require('dotenv')
dotenv.config()

// const username = process.env.DB_USERNAME

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

// hulp gekregen van Ivo om afbeelding zichtbaar te maken
app.use(express.static('static'))

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', (req, res) => {
    res.render('home', { title: 'Home' })
})

app.get('/sign-up', (req, res) => {
    res.render('sign-up', { title: 'Sign in' })
})

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
})

app.get('/profile', (req, res) => {
    res.render('profile', { title: 'Profile' })
})

// not working right now, but later im going to work on it !DO NOT FORGET!
// app.get('/404', (req, res) => {
//     res.render('404', { title: '404' })
// })

app.use((req, res) => {
    res.status(404).send('<h1>Page not found on the server</h1>')
})

app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
