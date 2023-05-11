const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const PORT = process.env.PORT || 3000

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', (req, res) => {
    res.render('home', { title: 'Home' })
})

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' })
})

app.use((req, res, next) => {
    res.status(404).send(
        '<h1>Page not found on the server</h1>')
})

app.listen(PORT, () => {
    console.log('App running on port', PORT)
})
