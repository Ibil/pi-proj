'use strict'

const express = require('express')
const passport = require('passport')
const borgaWebAPI = require('./borga-web-api')
const borgaWebAPP = require('./borga-web-site')

/**
 * @param {Express} app 
 */
module.exports = function(app) {
    app.use(express.json()) // Parses of HTTP request body 
    app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(express.urlencoded({ extended: true })) // for populating req.body with json after being parsed by app.use(express.json())
    
    app.use(borgaWebAPI);

    app.set('view engine', 'hbs');
    app.use(express.static('public')); // serve static contents (css, js)
    app.use('/app', borgaWebAPP);

    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        res
            .status(err.status || 500) // TODO might want to remove 500 from here
            .json({ message: err.message })
    })
}