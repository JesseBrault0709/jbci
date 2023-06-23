import { CommandModule } from 'yargs'
import Logger from '../Logger'
import getStartServerCommand from './getStartServerCommand'
import getUserCommand from './getUserCommand'

// Not ReadonlyArray because yargs complains
const getCommands = (logger: Logger, logsDir: string): CommandModule[] => [
    getStartServerCommand(logger, logsDir),
    getUserCommand(logger)
]

export default getCommands
