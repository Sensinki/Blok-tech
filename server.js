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
// axios API
const axios = require('axios')
// user schema
const User = require('./models/user')
const users = []

// PORT
const PORT = process.env.PORT || 4000

// BASIC SETTINGS

// om static zichtbaar te maken (behulp van Ivo)
app.use(express.static('static'))
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// Configure Middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        // modifing sessions
        saveUninitialized: true,
    }),
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
            useUnifiedTopology: true,
        })

        .then(() => {
            console.log('database is workingg')
        })
        .catch((err) => console.log(err))
})
database()

// API
app.get('/api/games', async (req, res) => {
    try {
        const response = await axios.get('https://www.gamerpower.com/api/giveaways')
        const data = response.data

        console.log(data)

        const Games = require('./models/game.js')
        data.forEach(async (item) => {
            const game = new Games({
                id: item.id,
                title: item.title,
                image: item.featured || item.thumbnail || item.cover,
            })
            await game.save()
        })

        res.json(data)
    } catch (error) {
        const errorMessage = 'An error occurred while fetching data from the API.'
        res.render('profile', { errorMessage })

        console.error('Error:', error)
        // res.status(500).json({ error: 'An error occurred' })
    }
})

// ROUTES

// Handling user login
app.post('/login-check', async (req, res) => {
    const { email, password, 'g-recaptcha-response': recaptchaResponse } = req.body

    // Verify reCAPTCHA
    const secretKey = '6Ld8U9cmAAAAACgfMPbD7uRu9320XBLAUcAyqlCD'
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify'
    const remoteIP = req.connection.remoteAddress

    try {
        const response = await axios.post(verificationUrl, null, {
            params: {
                secret: secretKey,
                response: recaptchaResponse,
                remoteip: remoteIP,
            },
        })

        const { success } = response.data

        if (success) {
            // reCAPTCHA verification succeeded, continue with login logic
            const submittedEmail = email
            const submittedPassword = password
            const user = await User.findOne({ email: submittedEmail })

            // Hulp gekregen van Janno en Ivo and a friend
            if (user) {
                bcrypt.compare(submittedPassword, user.password, (err, result) => {
                    if (err) {
                        console.error(err)
                        return res.status(500).send('Error occurred while comparing passwords.')
                    }

                    if (result) {
                        // If the password matched, store the email in the session
                        req.session.email = submittedEmail
                        res.render('profile', { user })
                    } else {
                        res.render('login', { messages: { error: 'Password is incorrect.' } })
                    }
                })
            } else {
                res.render('login', { messages: { error: 'No user with this email address' } })
            }
        } else {
            // reCAPTCHA verification failed
            res.render('login', { messages: { error: 'reCAPTCHA verification failed. Please try again.' } })
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Error occurred while verifying reCAPTCHA.')
    }
})

// making an account
app.post('/sign-up', async (req, res) => {
    // fallback for disbabled js
    const { password } = req.body

    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const isMinimumLength = password.length >= 5

    if (!hasUppercase || !hasNumber || !isMinimumLength) {
        // If password does not meet the requirements
        return res.status(400).send('Password must contain at least 1 uppercase letter, 1 number, and be minimum 5 characters long.')
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        })

        await user.save()

        // Store the email in the session
        req.session.email = req.body.email

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
    const userEmail = req.session.email

    try {
        await User.findOneAndDelete({ email: userEmail })
        req.session.destroy()
        res.redirect('/deletedaccount')
        console.log('Account deleted successfully')
    } catch (error) {
        console.log(error)
        res.redirect('/profile')
    }
})

// LAATSTE ROUTE ERROR(404) PAGINA
app.get('/*', (req, res) => {
    res.status(404).render('404', { title: '404' })
})

app.use(function (req, res) {
    res.locals.title = 'Error 404'
    res.status(404).render('404', {
        path: 'Error',
    })
})

// PORT
app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
