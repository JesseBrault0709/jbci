import path from 'path'
import { CommandModule } from 'yargs'
import Logger from '../Logger'
import getApp from '../getApp'
import getConfigs from '../getConfigs'
import { getBuildScriptRunner } from '../repository/BuildScriptRunner'
import { HookCallback } from '../repository/Config'
import Services from '../services/Services'

const getHandler = (services: Services, logger: Logger, hookCallback: HookCallback) => async () => {
    logger.info('Starting server...')

    const scriptsDir = path.join(process.cwd(), 'scripts')
    const buildScriptRunner = getBuildScriptRunner(scriptsDir, logger)

    const configs = await getConfigs(logger, buildScriptRunner)(path.join(process.cwd(), 'configs'))

    configs.forEach(config => logger.info(`Loaded config for repository: ${config.repository}.`))

    const port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 4000

    const app = getApp(services, logger, configs, hookCallback)

    app.listen(port, () => {
        logger.info(`Listening on port ${port}.`)
    })
}

const getStartServerCommand = (services: Services, logger: Logger, hookCallback: HookCallback): CommandModule => ({
    command: 'start',
    describe: 'starts the jbci server',
    handler: getHandler(services, logger, hookCallback)
})

export default getStartServerCommand
