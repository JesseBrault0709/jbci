import Logger from '../Logger'
import ScriptRunner from '../ScriptRunner'
import {
    GithubRequest,
    RepositoryRequestHandler
} from '../repository/Repository'

const getGithubFinalHandler =
    (logger: Logger, scriptRunner: ScriptRunner): RepositoryRequestHandler =>
    (req: GithubRequest, res, next) => {
        if (req.event === 'ping') {
            logger.info(
                `received successful github ping for repository ${req.params.repository}`
            )
            res.sendStatus(200) // OK
        } else {
            const { event } = req
            if (req.config !== undefined) {
                const onSpec = req.config.on.find(
                    onSpec => onSpec.event === event
                )
                if (onSpec !== undefined) {
                    const runScript = () => {
                        try {
                            scriptRunner.runOnSpec(onSpec)
                            res.sendStatus(200) // OK
                        } catch (error) {
                            logger.error(error)
                            res.sendStatus(500) // Internal Server Error
                        }
                    }

                    if ('ref' in req.body && onSpec.ref !== undefined) {
                        if (req.body.ref === onSpec.ref) {
                            runScript()
                        } else {
                            res.sendStatus(200) // OK
                        }
                    } else {
                        runScript()
                    }
                } else {
                    logger.info(
                        `received event ${event} but there is no onSpec for it; ignoring`
                    )
                    res.sendStatus(200) // OK
                }
            } else {
                logger.error('req.config is undefined')
                res.sendStatus(500) // Internal Server Error
            }
        }
    }

export default getGithubFinalHandler
