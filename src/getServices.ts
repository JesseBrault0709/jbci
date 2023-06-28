import { PrismaClient } from '@prisma/client'
import Logger from './Logger'
import Services from './services/Services'
import getAuthService from './services/authService'
import getBuildService from './services/buildService'
import getHookResultService from './services/hookResultService'
import getSessionService from './services/sessionService'
import getUserService from './services/userService'

const getServices = (prismaClient: PrismaClient, logger: Logger): Services => {
    const authService = getAuthService(logger)
    const buildService = getBuildService(prismaClient, logger)
    const hookResultService = getHookResultService(prismaClient, logger)
    const sessionService = getSessionService(prismaClient, logger)
    const userService = getUserService(prismaClient, authService, logger)

    return {
        authService,
        buildService,
        hookResultService,
        sessionService,
        userService
    }
}

export default getServices
