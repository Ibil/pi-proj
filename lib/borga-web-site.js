'use strict'

const express = require('express')
const app = express()
const router = require('express').Router()
const passport = require('passport')
const services = require("./borga-services");

const AUTHORIZATION_HEADER_KEY = "Authorization";

router.get('/signin', (req, res) => {
    const alert = req.session ? req.session.alert : {}
    delete req.session.alert
    res.render('signin')
})

router.delete('/logout', (req, res) => {
    req.logout()
    res.locals.alert = {
        title: 'Success',
        kind: 'success',
        message: "Logged out successfully"
    }
    res.render('index')
})

router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.loggedIn = true;
    }
    next()
})

router.get('', (req, res) => {
    res.render('index')
})

router.get('/games/popular', (req, res, next) => {
    services.getMostPopularGames(5)
        .then(responseBody => {
            const model = responseBody.games.map(game => {
                return {
                    id: game.id,
                    name: game.name,
                    description: game.description_preview,
                    url: game.url
                }
            })
            return res.render('games', { 'games': model })
        })
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to get popular games',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
})

router.get("/gameDetails/:name", (req, res, next) => {
    const gameName = req.params.name
    services.getGameDetails(gameName)
        .then(details => {
            res.render('gameDetails', details)
        })
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to get game details',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
})


router.get("/search/games", (req, res, next) => {
    const gameName = req.query.game
    services.searchGamesByName(gameName)
        .then((games) => res.render('games', games))
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to search for games',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
})

router.use(checkAuthentication)

router.get('/groups', (req, res, next) => {
    services.getAllGroup(req.user)
        .then(responseBody => {
            const model = responseBody.map(group => {
                return {
                    id: group.id,
                    tokenmodel: req.user,
                    name: group.name,
                    description: group.description,
                }
            })
            return res.render('groups', { 'groups': model })
        })
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to find the requested group',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
})


router.post('/groups', (req, res, next) => {
    services.createGroup(
        req.user,
        req.body.name,
        req.body.description
    )
        .then(groupId => {
            res.redirect(`/app/group/${groupId}`)
        })
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to Create a new group',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
})

router.post("/group/game", (req, res, next) => {
    services
        .addGame(
            req.user,
            req.body.groupId,
            req.body.gameId,
            req.body.gameName
        )
        .then(() => {
            res.redirect(`/app/group/${req.body.groupId}`)
        })
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to Create a new game',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
});


router.get("/group/:groupId", (req, res, next) => {
    services.getGroupDetails(req.user, req.params.groupId)
        .then(groupDetails => {
            res.render('groupDetails', groupDetails)
        })
        .catch(err => {
            res.locals.alert = {
                title: 'Unable to get the requested group',
                kind: 'danger',
                message: err.message
            }
            res.render('index');
        })
})

function checkAuthentication(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.alert = {
            title: 'Acess Forbiden',
            kind: 'danger',
            message: 'User must be authenticated to access user\'s data'
        }
        res.redirect('/app/signin')
    }
    else next()
}

passport.serializeUser((token, done) => done(null, token))

passport.deserializeUser((token, done) => done(null, token))


module.exports = router