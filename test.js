// file to handle all server related things

// setting up the variables

// server (express)

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// engine

const { engine } = require('express-handlebars')
const session = require('express-session')

// other js files

// const User = require("./models/User.js");
const database = require('./database.js')
const User = require('./models/User.js')

// rest

const bcrypt = require('bcrypt')

// express & express handlebars & express session

app.use('/public', express.static('public'))
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', 'views')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// session

app.use(
    session({
        secret: 'youdidnthearthisfrommebutyouareanerd',
        saveUninitialized: true,
        resave: false
    })
)

// routes

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup' })
})

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
})

// make an account

app.post('/signup', async (req, res) => {
    const { username, email, age, password } = req.body
    // const newUser = {
    //   username: req.body.username,
    //   email: req.body.email,
    //   age: req.body.age,
    //   password: req.body.password,
    // };

    // check username
    if (!username) {
        req.session.error = 'Please provide a username!'
        res.render('signup', { error: req.session.error })
    }

    // check email
    if (email) {
    }

    // check age
    if (age) {
    }

    // check password
    const saltRounds = 10
    bcrypt.hash(password, saltRounds, (err, hash) => {})

    await User.create({ username, email, age, password })

    req.session.username = newUser.username

    res.redirect('questions')
})

// login

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body

        User.findOne(username).then((user) => {
            if (user) {
                const checkingPassword = bcrypt.compare(password, username.password)
                if (checkingPassword) {
                    req.session.username = req.body.username
                    res.redirect('questions')
                } else {
                    req.session.error = 'Password incorrect'
                    res.render('login', { error: req.session.error })
                }
            } else {
                console.log("User doesn't exist")
                res.render('login', { error: req.session.error })
            }
        })
    } catch (error) {
        console.log(error)
    }
})

app.get('/questions', (req, res) => {
    const username = req.session.username
    res.render('questions', { title: 'MovieMatcher', username })
})

app.get('/matcher', (req, res) => {
    res.render('matcher', { title: 'MovieMatcher' })
})

app.get('/search', (req, res) => {
    res.render('search', { title: 'Search' })
})

app.get('/list', (req, res) => {
    res.render('list', { title: 'List' })
})

app.get('/profile', (req, res) => {
    const username = req.session.username
    const email = req.session.email
    const age = req.session.age
    const password = req.session.password
    res.render('profile', { title: 'Profile', email, username, age, password })
})

app.get('*', (req, res) => {
    res.render('404', { title: '404 page not found' })
})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})
