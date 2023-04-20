//require statements that import packages to use in code
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
require('dotenv').config()
const User = require('./models/user')
const Product = require('./models/product')
const bcrypt = require('bcrypt')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const userRouter = require('./router/user')


app.listen(process.env.PORT)
console.log("Starting server on Port 3000")

//method calls to the app variable to create path directories and set up instructions for the server to use
app.use(express.urlencoded({extended:true})); // this middleware is essential for express to parse data coming in from post requests
app.use(express.static(path.join(__dirname,'public'))) //this middleware tells express where to serve static assets from
app.set('views',path.join(__dirname,'views')) // this tells express where to look for templates when using res.render
app.set('view engine','ejs') // this tells express what tempalte engine to use eg. pug,hbs ejs etc.
app.use(express.json())

//url connection for mongoDB
const mongoURL = process.env.MONGO_URL
//connects to the db
mongoose.connect(mongoURL,{ useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
    if(err)
        console.log("Could not connect to database",err)
    else
        console.log("Connected to DB..")
})

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoURL
    })
}))

app.use(userRouter)


