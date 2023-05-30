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
const session = require('express-session')
// user schema
const User = require('./models/user')
const users = []
const bodyParser = require('body-parser')

// PORT
const PORT = process.env.PORT || 3000

// BASIC SETTINGS

// om static zichtbaar te maken (behulp van Ivo)
app.use(express.static('static'))
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// Configure Middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        // modifing sessions
        saveUninitialized: true
    })
)

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
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
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

app.get('/deletedaccount', (req, res) => {
    res.render('deletedaccount', { title: 'Deleted Account' })
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

// DELETE ACCOUNT
app.post('/delete', async (req, res) => {
    try {
        const submittedEmail = req.body.email
        // checking why submittedEmail not working
        console.log('req.body:', req.body)

        console.log('submittedEmail:', submittedEmail)
        // Find and delete the user using the User model
        const result = await User.deleteOne({ email: submittedEmail })

        console.log('result:', result)

        if (result.deletedCount === 0) {
            res.status(404).send('Gebruiker niet gevonden')
            return
        }

        res.redirect('/deletedaccount')
    } catch (error) {
        console.error(error)
        res.status(500).send('Er is een fout opgetreden bij het verwijderen van de gebruiker')
    }
})

// LAATSTE ROUTE ERROR(404) PAGINA
app.get('/*', (req, res) => {
    res.status(404).render('404', { title: '404' })
})

app.use(function (req, res) {
    res.locals.title = 'Error 404'
    res.status(404).render('404', {
        path: 'Error'
    })
})

// PORT
app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
