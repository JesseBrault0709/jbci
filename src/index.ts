import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import Logger, { combinePrinters, getDefaultConsolePrinter, getDefaultFormatter } from './Logger'
import getCommands from './cli/getCommands'
import { VERSION } from './version'
import Services from './services/Services'
import getAuthService from './services/authService'
import getUserService from './services/userService'
import getSessionService from './services/sessionService'
import { PrismaClient } from '@prisma/client'

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

const getServices = (prismaClient: PrismaClient, logger: Logger): Services => {
    const authService = getAuthService(logger)
    const sessionService = getSessionService(prismaClient, logger)
    const userService = getUserService(prismaClient, authService, logger)

    return {
        authService,
        sessionService,
        userService
    }
}

const main = async () => {
    const logsDir = path.join(process.cwd(), 'logs')
    const logger = await getLogger(logsDir)
    logger.info('----')
    logger.info(`jbci ${VERSION}`) // TODO: always bump this!
    logger.info('----')

    const prismaClient = new PrismaClient()

    yargs(hideBin(process.argv))
        .command(getCommands(getServices(prismaClient, logger), logger, logsDir))
        .parse()
}

main()
