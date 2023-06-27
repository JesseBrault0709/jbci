import { User } from '@prisma/client'
import { compare, hash } from 'bcrypt'
import Logger from '../Logger'

export interface AuthService {
    hashPassword(rawPassword: string): Promise<string>
    verifyUser(givenPassword: string, user: User): Promise<boolean>
}

const hashPassword: AuthService['hashPassword'] = async rawPassword => {
    const saltRounds = process.env.SALT_ROUNDS
    if (saltRounds === undefined) {
        throw new Error('SALT_ROUNDS is not defined in .env')
    }
    return await hash(rawPassword, parseInt(saltRounds))
}

const verifyUser: AuthService['verifyUser'] = async (givenPassword, user) => {
    return compare(givenPassword, user.password)
}

const authService: AuthService = {
    hashPassword,
    verifyUser
}

const getAuthService = (logger: Logger) => authService

export default getAuthService
