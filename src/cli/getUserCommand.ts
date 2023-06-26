import { CommandModule } from 'yargs'
import Logger from '../Logger'
import getUserCreateCommand from './getUserCreateCommand'
import getUserModifyCommand from './getUserModifyCommand'
import getUserDeleteCommand from './getUserDeleteCommand'

const getUserCommand = (logger: Logger): CommandModule => ({
    command: 'user',
    describe: 'create, modify, and delete users',
    builder: yargs =>
        yargs
            .command(getUserCreateCommand(logger))
            .command(getUserModifyCommand(logger))
            .command(getUserDeleteCommand(logger)),
    handler: args => {
        throw new Error(`Unknown subcommand for user: '${args._.slice(-1)}'. Please see 'user --help'.`)
    }
})

export default getUserCommand
