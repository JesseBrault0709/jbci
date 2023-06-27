import Logger from '../Logger'
import path from 'path'
import ScriptRunner from '../ScriptRunner'
import getApp from '../getApp'
import getConfigs from '../getConfigs'
import { CommandModule } from 'yargs'
import Services from '../services/Services'

const getHandler = (services: Services, logger: Logger, logsDir: string) => async () => {
    logger.info('Starting server...')

    const scriptsDir = path.join(process.cwd(), 'scripts')
    const scriptRunner = new ScriptRunner(logger, scriptsDir, logsDir)

    const configs = await getConfigs(logger, scriptRunner)(path.join(process.cwd(), 'configs'))

    configs.forEach(config => logger.info(`Loaded config for repository: ${config.repository}.`))

    const port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 4000

    const app = getApp(services, logger, configs)

    app.listen(port, () => {
        logger.info(`Listening on port ${port}.`)
    })
}

const getStartServerCommand = (services: Services, logger: Logger, logsDir: string): CommandModule => ({
    command: 'start',
    describe: 'starts the jbci server',
    handler: getHandler(services, logger, logsDir)
})

export default getStartServerCommand
