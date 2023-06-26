import express, { Handler, Router } from 'express'
import expressSession from 'express-session'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import Home from './public/home/Home'
import Dashboard from './secure/dashboard/Dashboard'
import JbciSessionStore from './JbciSessionStore'
import userService from '../services/userService'

const getSessionMiddleware = (): Handler => {
    const { SESSION_SECRET } = process.env
    if (SESSION_SECRET === undefined) {
        throw new Error('SESSION_SECRET is undefined in .env')
    }

    return expressSession({
        cookie: {
            httpOnly: true,
            sameSite: true,
            secure: process.env.NODE_ENV === 'production'
        },
        resave: false,
        saveUninitialized: true,
        secret: SESSION_SECRET
    })
}

const isLoggedIn: Handler = (req, res, next) => {
    console.log(`req.session: ${req.session}`)
    if (req.session.user === undefined) {
        res.sendStatus(401)
    } else {
        next()
    }
}

const getViewsRouter = (): Router => {
    const router = express.Router()

    // all routes
    router.use(getSessionMiddleware())

    // public routes
    router.use('/assets', express.static('static/public'))
    router.use('/assets', express.static('build/static/public'))
    router.get('/', (req, res) => {
        const { pipe } = renderToPipeableStream(<Home />, {
            bootstrapScripts: ['/assets/home/index.js']
        })
        pipe(res)
    })
    router.post('/login', express.urlencoded({ extended: false }), async (req, res, next) => {
        try {
            const user = await userService.login(req.body.username, req.body.password)
            if (user === null) {
                res.redirect('/')
            } else {
                req.session.regenerate(err => {
                    if (err) {
                        console.error(err)
                        res.sendStatus(500)
                    } else {
                        req.session.user = user
                        req.session.save(err => {
                            if (err) {
                                console.error(err)
                                res.sendStatus(500)
                            } else {
                                res.redirect('/secure/dashboard')
                            }
                        })
                    }
                })
            }
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    })

    // secure routes
    router.use('/secure/assets', isLoggedIn, express.static('static/secure'))
    router.use('/secure/assets', isLoggedIn, express.static('build/static/secure'))
    router.get('/secure/dashboard', isLoggedIn, (req, res) => {
        const { pipe } = renderToPipeableStream(<Dashboard />, {
            bootstrapScripts: ['/secure/assets/dashboard/index.js']
        })
        pipe(res)
    })

    return router
}

export default getViewsRouter
