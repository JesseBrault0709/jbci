import inquirer, { Question } from 'inquirer'
import Logger from '../Logger'
import userService from '../services/userService'
import { CommandModule } from 'yargs'

export type CreateUserArgs = {
    username: string
}

type CreateUserPromptAnswers = {
    password: string
    passwordRepeat: string
}

const getHandler = (logger: Logger) => async (args: CreateUserArgs) => {
    const passwordQuestion: Question<CreateUserPromptAnswers> = {
        message: 'Enter the password for the user:',
        name: 'password',
        type: 'password'
    }
    const passwordRepeatQuestion: Question<CreateUserPromptAnswers> = {
        message: 'Repeat the password for the user:',
        name: 'passwordRepeat',
        type: 'password'
    }
    const answers = await inquirer.prompt([passwordQuestion, passwordRepeatQuestion])

    if (answers.password !== answers.passwordRepeat) {
        logger.error('passwords do not match!')
    } else {
        logger.info(`Creating user with username: ${args.username}.`)
        const user = await userService.createUser(args.username, answers.password)
        logger.info(`Successfully created user with username: ${user.username}.`)
    }
}

const getUserCreateCommand = (logger: Logger): CommandModule<{}, CreateUserArgs> => ({
    command: 'create',
    describe: 'create a user',
    builder: yargs => {
        return yargs.option('username', {
            alias: 'u',
            demandOption: true,
            describe: 'the username of the user to be created',
            type: 'string'
        })
    },
    handler: getHandler(logger)
})

export default getUserCreateCommand
