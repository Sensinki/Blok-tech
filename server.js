// define
const express = require('express')
const mongoose = require('mongoose')
const { engine } = require('express-handlebars')

const app = express()
const PORT = process.env.PORT || 3000

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

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// hulp gekregen van Ivo om afbeelding zichtbaar te maken
app.use(express.static('static'))

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

app.use((req, res, next) => {
  res.status(404).render('404', { title: '404' })
})

app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
