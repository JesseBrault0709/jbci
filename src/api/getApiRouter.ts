import express, { Router } from 'express'
import Logger from '../Logger'

const getApiRouter = (logger: Logger): Router => {
    const router = express.Router()
    router.post('/login', express.json(), (req, res) => {
        logger.info('recieved login request! ')
        logger.info(`body: ${JSON.stringify(req.body)}`)
        res.status(200)
        res.send('Hello from the server!')
    })
    return router
}

export default getApiRouter
