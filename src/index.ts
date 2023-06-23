import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import Logger, { combinePrinters, getDefaultConsolePrinter, getDefaultFormatter } from './Logger'
import getCommands from './cli/getCommands'
import { VERSION } from './version'

dotenv.config()

const getLogger = async (logsDir: string): Promise<Logger> => {
    try {
        await fs.mkdir(path.join(process.cwd(), 'logs'))
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            console.error(err)
        }
    }

    const logFile = await fs.open(path.join(logsDir, 'index.log'), 'a')

    return new Logger(
        combinePrinters(getDefaultConsolePrinter(), async s => {
            await logFile.write(`${s}\n`)
        }),
        getDefaultFormatter()
    )
}

const main = async () => {
    const logsDir = path.join(process.cwd(), 'logs')
    const logger = await getLogger(logsDir)
    logger.info('----')
    logger.info(`jbci ${VERSION}`) // TODO: always bump this!
    logger.info('----')

    yargs(hideBin(process.argv)).command(getCommands(logger, logsDir)).parse()
}

main()
