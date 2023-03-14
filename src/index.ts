import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import Logger, {
    combinePrinters,
    getDefaultConsolePrinter,
    getDefaultFormatter
} from './Logger'
import ScriptRunner from './ScriptRunner'
import getApp from './getApp'
import getConfigs from './getConfigs'
import { VERSION } from './version'

dotenv.config()

const getLogger = async (logFilePath: string) => {
    const logFile = await fs.open(logFilePath, 'a')
    return new Logger(
        combinePrinters(getDefaultConsolePrinter(), async s => {
            await logFile.write(`${s}\n`)
        }),
        getDefaultFormatter()
    )
}

const main = async () => {
    try {
        await fs.mkdir(path.join(process.cwd(), 'logs'))
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            console.error(err)
        }
    }

    const logsDir = path.join(process.cwd(), 'logs')

    const logger = await getLogger(path.join(logsDir, 'index.log'))

    logger.info('----')
    logger.info(`Starting jbci ${VERSION}`) // TODO: always bump this!
    logger.info('----')

    const configs = await getConfigs(logger)(
        path.join(process.cwd(), 'configs')
    )

    configs.forEach(config =>
        logger.info(`loaded config for repository: ${config.repository}`)
    )

    const port =
        process.env.PORT !== undefined ? parseInt(process.env.PORT) : 4000

    const scriptsDir = path.join(process.cwd(), 'scripts')
    const scriptRunner = new ScriptRunner(logger, scriptsDir, logsDir)

    const app = getApp(logger, configs, scriptRunner)

    app.listen(port, () => {
        logger.info(`listening on port ${port}`)
    })
}

main()
