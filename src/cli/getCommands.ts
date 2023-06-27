import { CommandModule } from 'yargs'
import Logger from '../Logger'
import getStartServerCommand from './getStartServerCommand'
import getUserCommand from './getUserCommand'
import Services from '../services/Services'

// Not ReadonlyArray because yargs complains
const getCommands = (services: Services, logger: Logger, logsDir: string): CommandModule[] => [
    getStartServerCommand(services, logger, logsDir),
    getUserCommand(services.userService, logger)
]

export default getCommands
