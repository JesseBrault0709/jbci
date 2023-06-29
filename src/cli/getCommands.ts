import { CommandModule } from 'yargs'
import Logger from '../Logger'
import getStartServerCommand from './getStartServerCommand'
import getUserCommand from './getUserCommand'
import Services from '../services/Services'
import { HookCallback } from '../config/Config'

// Not ReadonlyArray because yargs complains
const getCommands = (services: Services, logger: Logger, hookCallback: HookCallback): CommandModule[] => [
    getStartServerCommand(services, logger, hookCallback),
    getUserCommand(services.userService, logger)
]

export default getCommands
