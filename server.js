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
        .catch(err => console.log(err))
})

database()

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', (req, res) => {
    res.send('home', { title: 'Home' })
})

app.get('/sign-in', (req, res) => {
    res.render('sign-in', { title: 'Sign in' })
})

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
})

app.get('/profile', (req, res) => {
    res.render('profile', { title: 'Profile' })
})

app.use((req, res, next) => {
    res.status(404).send(
        '<h1>Page not found on the server</h1>')
})

app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
