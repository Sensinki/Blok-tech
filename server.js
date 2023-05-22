if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// IMPORTING
const express = require('express')
const app = express()
// templating engine
const { engine } = require('express-handlebars')
// for password
const bcrypt = require('bcrypt')
// database
const mongoose = require('mongoose')
// authentication
const passport = require('passport')
const initializePassport = require('./passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
// user schema
const User = require('./models/user')

// PORT
const PORT = process.env.PORT || 3000

//
const users = []

// BASIC SETTINGS
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

//
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

// APP.USE
app.use(express.urlencoded({ extended: false }))
// error messages
app.use(flash())
// ?
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
// ?
app.use(express.json())

// om static zichtbaar te maken (behulp van Ivo)
app.use(express.static('static'))

// .ENV FILE
const dotenv = require('dotenv')
dotenv.config()

// DATABASE
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

// app.get()

// CREATE USER ??
// later kijken
// async function run () {
//     try {
//         const user = await User.create({
//             name: 'etss',
//             username: 'hi',
//             email: 's@s',
//             password: 'teyrg'
//         })
//         console.log(user)
//     } catch (e) {
//     console.log(e.message)
//     }
// }
// run()

// APP.POST
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

// ROUTES
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

// test
app.get('/test', async (req, res) => {
    const doc = await User.findOne()
    console.log(doc)
})

// LOGOUT
app.post('/logout', (req, res) => {
    req.logout(req.user, err => {
        if (err) return (err)
        res.redirect('/')
    })
})

// AUTHENTICATED OR NOT
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

// LAATSTE ROUTE ERROR(404) PAGINA
app.get('/', (req, res) => {
    res.status(404).render('404', { title: '404' })
})

// PORT
app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
