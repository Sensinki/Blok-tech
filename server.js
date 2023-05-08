const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const PORT = process.env.PORT || 3000

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
