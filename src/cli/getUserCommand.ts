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
    handler: () => {
        throw new Error('how did you get here?')
    }
})

export default getUserCommand
