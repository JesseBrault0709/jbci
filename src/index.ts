import getConfigs from './getConfigs'
import Logger from './Logger'
import fs from 'fs/promises'
import path from 'path'
import App from './App'
import dotenv from 'dotenv'
import ScriptRunner from './ScriptRunner'

dotenv.config()

const getLogger = async (logFilePath: string) => {
    const logFile = await fs.open(logFilePath, 'a')
    return new Logger(
        async (s, level) => {
            if (level === 'ERROR') {
                console.error(s)
            } else {
                console.log(s)
            }
            await logFile.write(`${s}\n`)
        },
        (date, level, msg) => `${date.toUTCString()} ${level}: ${msg}`
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

    const app = new App(logger, port, configs, scriptRunner)

    app.start()
}

main()
