import { Prisma, User } from '@prisma/client'
import prismaClient from '../prismaClient'
import authService from './authService'

export interface UserService {
    createUser(username: string, password: string): Promise<User>
    deleteUser(username: string): Promise<void>
    getUserById(id: number): Promise<User | null>
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

const getUserById: UserService['getUserById'] = async id => {
    return await prismaClient.user.findUnique({
        where: {
            id
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
    getUserById,
    login,
    modifyUser
}

export default userService
