import { Response } from 'express'
import Logger from '../Logger'
import ScriptRunner from '../ScriptRunner'
import { RepositoryRequest } from './getRepositoryRouter'

const getRepositoryFinalHandler =
    (logger: Logger, scriptRunner: ScriptRunner) =>
    async (req: RepositoryRequest, res: Response) => {
        if ('action' in req.body) {
            if (req.body.action === 'ping') {
                logger.info(
                    `received successful ping for repository ${req.params.repository}`
                )
                res.send(200) // OK
            } else {
                const action = req.body.action
                if (req.config !== undefined) {
                    const onSpec = req.config.on.find(
                        onSpec => onSpec.action === action
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
                            `received action ${action} but there is no onSpec for it; ignoring`
                        )
                        res.sendStatus(200) // OK
                    }
                } else {
                    logger.error('req.config is undefined')
                    res.sendStatus(500) // Internal Server Error
                }
            }
        } else {
            logger.info('action is not in req.body')
            res.sendStatus(400) // Bad Request
        }
    }

export default getRepositoryFinalHandler
