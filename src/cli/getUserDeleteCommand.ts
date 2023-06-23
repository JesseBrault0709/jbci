import { CommandModule } from 'yargs'
import Logger from '../Logger'
import userService from '../services/userService'

export type DeleteUserArgs = { username: string }

const getHandler = (logger: Logger) => async (args: DeleteUserArgs) => {
    logger.info(`Deleting user with username: ${args.username}.`)
    await userService.deleteUser(args.username)
    logger.info(`Successfully deleted user with username: ${args.username}.`)
}

const getUserDeleteCommand = (logger: Logger): CommandModule<{}, DeleteUserArgs> => ({
    command: 'delete',
    describe: 'delete a user',
    builder: yargs =>
        yargs.option('username', {
            alias: 'u',
            demandOption: true,
            describe: 'the username of the user to be deleted',
            type: 'string'
        }),
    handler: getHandler(logger)
})

export default getUserDeleteCommand
