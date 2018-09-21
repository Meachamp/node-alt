const express = require('express')
const helmet = require('helmet')
const config = require('./config')
const parser = require('body-parser')
const fs = require('fs')
const path = require('path')

const app = express()

app.use(helmet.noCache())
app.use(helmet.frameguard())
app.disable('x-powered-by');
app.use(parser.json())

fs.readdirSync(path.join(__dirname, "routes")).forEach((f) => {
    require('./routes/' + f)(app)
})

app.listen(config.server.listenPort, () => {
    console.log('Server started.')
})