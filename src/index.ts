import getConfigs from './getConfigs'
import Logger from './Logger'
import fs from 'fs/promises'
import path from 'path'
import App from './App'
import dotenv from 'dotenv'

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

    const logger = await getLogger(
        path.join(process.cwd(), 'logs', 'index.log')
    )

    const configs = await getConfigs(logger)(
        path.join(process.cwd(), 'configs')
    )

    configs.forEach(config =>
        logger.info(`loaded config for repository: ${config.repository}`)
    )

    const port =
        process.env.PORT !== undefined ? parseInt(process.env.PORT) : 4000

    const app = new App(
        logger,
        port,
        configs,
        path.join(process.cwd(), 'scripts'),
        path.join(process.cwd(), 'logs')
    )
    app.start()
}

main()
