import inquirer, { Question } from 'inquirer'
import Logger from '../Logger'
import { Prisma } from '@prisma/client'
import { UserService } from '../services/userService'
import { CommandModule } from 'yargs'

export type ModifyUserArgs = {
    username: string
    newUsername?: string
    updatePassword: boolean
}

type ModifyUserPromptAnswers = {
    password: string
    passwordRepeat: string
}

const getHandler = (userService: UserService, logger: Logger) => async (args: ModifyUserArgs) => {
    const input: Prisma.UserUpdateInput = {}
    let valid = true

    if (args.updatePassword) {
        const passwordQuestion: Question<ModifyUserPromptAnswers> = {
            message: 'Enter the new password:',
            name: 'password',
            type: 'password'
        }
        const passwordRepeatQuestion: Question<ModifyUserPromptAnswers> = {
            message: 'Repeat the new password:',
            name: 'passwordRepeat',
            type: 'password'
        }
        const answers = await inquirer.prompt([passwordQuestion, passwordRepeatQuestion])
        if (answers.password !== answers.passwordRepeat) {
            logger.error('Passwords do not match!')
            valid = false
        } else {
            input.password = answers.password
        }
    }

    if (args.newUsername !== undefined) {
        input.username = args.newUsername
    }

    logger.info(`Updating user with username: ${args.username}`)
    const user = await userService.modifyUser(args.username, input)
    logger.info(`Successfully updated user with id: ${user.id}, username: ${user.username}`)
}

const getUserModifyCommand = (userService: UserService, logger: Logger): CommandModule<{}, ModifyUserArgs> => ({
    command: 'modify',
    describe: 'modify a user',
    builder: yargs =>
        yargs
            .option('username', {
                alias: 'u',
                demandOption: true,
                describe: 'the username of the user to modified',
                type: 'string'
            })
            .option('updatePassword', {
                alias: 'p',
                default: false,
                describe: 'whether to update the password of the specified user',
                type: 'boolean'
            })
            .option('newUsername', {
                alias: 'new-username',
                describe: 'sets the username to the given (new) username',
                type: 'string'
            }),
    handler: getHandler(userService, logger)
})

export default getUserModifyCommand
