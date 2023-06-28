import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import getCommands from './cli/getCommands'
import getHookCallback from './getHookCallback'
import { VERSION } from './version'
import getServices from './getServices'
import getLogger from './getLogger'

dotenv.config()

const main = async () => {
    const logsDir = path.join(process.cwd(), 'logs')
    const logger = await getLogger(logsDir)
    logger.info('----')
    logger.info(`jbci ${VERSION}`) // TODO: always bump this!
    logger.info('----')

    const prismaClient = new PrismaClient()
    const services = getServices(prismaClient, logger)
    const hookCallback = getHookCallback(services)

    yargs(hideBin(process.argv)).command(getCommands(services, logger, hookCallback)).parse()
}

main()
