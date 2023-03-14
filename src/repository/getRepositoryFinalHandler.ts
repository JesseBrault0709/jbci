import { Response } from 'express'
import Logger from '../Logger'
import ScriptRunner from '../ScriptRunner'
import { RepositoryRequest } from './getRepositoryRouter'

const getRepositoryFinalHandler =
    (logger: Logger, scriptRunner: ScriptRunner) =>
    async (req: RepositoryRequest, res: Response) => {
        if (req.event != undefined) {
            if (req.event === 'ping') {
                logger.info(
                    `received successful ping for repository ${req.params.repository}`
                )
                res.sendStatus(200) // OK
            } else {
                const { event } = req
                if (req.config !== undefined) {
                    const onSpec = req.config.on.find(
                        onSpec => onSpec.event === event
                    )
                    if (onSpec !== undefined) {
                        try {
                            await scriptRunner.runOnSpec(onSpec)
                            res.sendStatus(200) // OK
                        } catch (error) {
                            logger.error(error)
                            res.sendStatus(500) // Internal Server Error
                        }
                    } else {
                        logger.info(
                            `received event ${event} but there is no onSpec for it; ignoring`
                        )
                        res.sendStatus(200) // OK
                    }
                } else {
                    logger.error('req.event is undefined')
                    res.sendStatus(500) // Internal Server Error
                }
            }
        } else {
            logger.error('req.event is undefined')
            res.sendStatus(400) // Bad Request
        }
    }

export default getRepositoryFinalHandler
