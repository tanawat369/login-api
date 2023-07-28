const express = require('express')
const cors = require('cors')
const app = express()
const morgan = require('morgan')
const bodyparser = require('body-parser')
require('dotenv').config()

const userData = require('./api/userdata')


app.use(cors())

app.use(morgan('dev'))

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

app.use(userData)

module.exports = app
