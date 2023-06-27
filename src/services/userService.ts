import { Prisma, PrismaClient, User } from '@prisma/client'
import { AuthService } from './authService'
import Logger from '../Logger'

export interface UserService {
    createUser(username: string, password: string): Promise<User>
    deleteUser(username: string): Promise<void>
    getUserById(id: number): Promise<User | null>
    login(username: string, password: string): Promise<User | null>
    modifyUser(oldUsername: string, input: Prisma.UserUpdateInput): Promise<User>
}

const getUserService = (prismaClient: PrismaClient, authService: AuthService, logger: Logger): UserService => ({
    async createUser(username, password) {
        logger.debug(`creating User with username: ${username}`)
        const hashedPassword = await authService.hashPassword(password)
        return await prismaClient.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })
    },
    async deleteUser(username) {
        logger.debug(`deleting User with username: ${username}`)
        await prismaClient.user.delete({
            where: {
                username
            }
        })
    },
    async getUserById(id) {
        logger.debug(`getting User with id: ${id}`)
        return await prismaClient.user.findUnique({
            where: {
                id
            }
        })
    },
    async login(username, password) {
        logger.debug(`attempting login for username: ${username}`)
        const user = await prismaClient.user.findUnique({
            where: {
                username
            }
        })
        if (user === null || !(await authService.verifyUser(password, user))) {
            return null
        } else {
            return user
        }
    },
    async modifyUser(oldUsername, input) {
        logger.debug(`modifying User with oldUsername: ${oldUsername}`)
        return await prismaClient.user.update({
            where: {
                username: oldUsername
            },
            data: input
        })
    }
})

export default getUserService
