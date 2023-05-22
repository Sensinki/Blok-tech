if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// importing
const express = require('express')
const app = express()

const { engine } = require('express-handlebars')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const passport = require('passport')
const initializePassport = require('./passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const PORT = process.env.PORT || 3000

const User = require('./models/user')

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.json())

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// hulp gekregen van Ivo om afbeelding zichtbaar te maken
app.use(express.static('static'))

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

async function run () {
    try {
        const user = await User.create({
            password: 'teyrg',
            email: 's@s',
            username: 'hi'
        })
        console.log(user)
    } catch (e) {
    console.log(e.message)
    }
}
run()

// configuring the login post functionalty
app.post('/login-check', checkNotAuthenticated, passport.authenticate('local', {
    succesRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))

// configuring the sign-up post functionalty
app.post('/sign-up', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (e) {
        console.log(e)
        res.redirect('/sign-up')
    }
    console.log(users)
})

app.post('/profile', checkAuthenticated, (req, res) => {
    res.render('profile', { title: 'Profile', name: req.user.name })
})

// Routes
app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('home', { title: 'Home' })
})

app.get('/sign-up', checkNotAuthenticated, (req, res) => {
    res.render('sign-up', { title: 'Sign in' })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login', { title: 'Login' })
})

app.get('/profile', checkAuthenticated, (req, res) => {
    res.render('profile', { title: 'Profile', name: req.user.name })
})

app.use((req, res, next) => {
  res.status(404).render('404', { title: '404' })
})

// ASK //
// ask what is the problem about next ???
// ASK //
app.delete('/logout', (req, res) => {
    req.logout(req.user, err => {
        if (err) return (err)
        res.redirect('/')
    })
})

function checkAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile')
    }
    next()
}

app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
