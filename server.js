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
// const flash = require('express-flash')
const session = require('express-session')
// const methodOverride = require('method-override')
// user schema
const User = require('./models/user')

// PORT
const PORT = process.env.PORT || 3000

//
const users = []

// BASIC SETTINGS

// om static zichtbaar te maken (behulp van Ivo)
app.use(express.static('static'))
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// Configure Middleware
app.use(express.urlencoded({ extended: false }))
// error messages
// app.use(flash())
app.use(express.json())

//
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        // modifing sessions
        saveUninitialized: true
    })
)

// app.use(methodOverride('_method'))
// ?

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

// ROUTES
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

// test
app.get('/test', async (req, res) => {
    const doc = await User.findOne()
    console.log(doc)
})

// Handling user login
// Hulp gekregen van Janno en Ivo and a friend
app.post('/login-check', async (req, res) => {
    const submittedEmail = req.body.email
    const submittedPassword = req.body.password
    const user = await User.findOne({ email: submittedEmail })

    if (user) {
        bcrypt.compare(submittedPassword, user.password, function (err, result) {
            if (err) {
                console.error(err)
                return res.status(500).send('Error occurred while comparing passwords.')
            }

            if (result) {
                // If the password matched
                res.render('profile', { user })
            } else {
                // Passwords didn't match
                res.render('login', { messages: { error: 'Password is incorrect.' } })
            }
        })
    } else {
        res.render('login', { messages: { error: 'No user with this email address' } })
        // No user with this email address
    }
})

// making an account
app.post('/sign-up', async (req, res) => {
    try {
        // console.log('@@-- the signup data', req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
            // sign: req.body.sign
        })

        await user.save()

        res.redirect('/login')
    } catch (e) {
        console.log('signup failed')
        res.redirect('/sign-up')
    }
    console.log(users)
})

app.post('/profile', (req, res) => {
    res.render('profile', { title: 'Profile', name: req.user.name })
})

// LOGOUT
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.')
        } else {
            return res.redirect('/login')
        }
    })
})

// LAATSTE ROUTE ERROR(404) PAGINA
app.get('/*', (req, res) => {
    res.status(404).render('404', { title: '404' })
})

// PORT
app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
