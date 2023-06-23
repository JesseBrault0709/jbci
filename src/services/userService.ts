import { Prisma, User } from '@prisma/client'
import prismaClient from '../prismaClient'
import authService from './authService'

export interface UserService {
    createUser(username: string, password: string): Promise<User>
    deleteUser(username: string): Promise<void>
    login(username: string, password: string): Promise<User | null>
    modifyUser(oldUsername: string, input: Prisma.UserUpdateInput): Promise<User>
}

const createUser: UserService['createUser'] = async (username, password) => {
    const hashedPassword = await authService.hashPassword(password)
    return await prismaClient.user.create({
        data: {
            username,
            password: hashedPassword
        }
    })
}

const deleteUser: UserService['deleteUser'] = async username => {
    await prismaClient.user.delete({
        where: {
            username
        }
    })
}

const login: UserService['login'] = async (username, password) => {
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
}

const modifyUser: UserService['modifyUser'] = async (oldUsername, input) => {
    return await prismaClient.user.update({
        where: {
            username: oldUsername
        },
        data: input
    })
}

const userService: UserService = {
    createUser,
    deleteUser,
    login,
    modifyUser
}

export default userService
