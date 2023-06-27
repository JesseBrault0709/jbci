import { CommandModule } from 'yargs'
import Logger from '../Logger'
import getUserCreateCommand from './getUserCreateCommand'
import getUserModifyCommand from './getUserModifyCommand'
import getUserDeleteCommand from './getUserDeleteCommand'
import { UserService } from '../services/userService'

const getUserCommand = (userService: UserService, logger: Logger): CommandModule => ({
    command: 'user',
    describe: 'create, modify, and delete users',
    builder: yargs =>
        yargs
            .command(getUserCreateCommand(userService, logger))
            .command(getUserModifyCommand(userService, logger))
            .command(getUserDeleteCommand(userService, logger)),
    handler: args => {
        throw new Error(`Unknown subcommand for user: '${args._.slice(-1)}'. Please see 'user --help'.`)
    }
})

export default getUserCommand
