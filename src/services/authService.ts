import { User } from '@prisma/client'
import { compare, hash } from 'bcrypt'
import { JwtPayload, sign, verify } from 'jsonwebtoken'

export interface AuthService {
    createAccessToken(user: User): string
    hashPassword(rawPassword: string): Promise<string>
    verifyAccessToken(rawToken: string): AccessToken | null
    verifyUser(givenPassword: string, user: User): Promise<boolean>
}

export interface AccessToken {
    id: number
}

const createAccessToken: AuthService['createAccessToken'] = user => {
    const { TOKEN_SECRET_KEY, TOKEN_EXPIRE } = process.env
    if (TOKEN_SECRET_KEY === undefined) {
        throw new Error('TOKEN_SECRET_KEY is undefined in .env')
    } else if (TOKEN_EXPIRE === undefined) {
        throw new Error('TOKEN_EXPIRE is undefined in .env')
    } else {
        return sign({}, TOKEN_SECRET_KEY, {
            subject: user.id.toString(),
            expiresIn: parseInt(TOKEN_EXPIRE)
        })
    }
}

const hashPassword: AuthService['hashPassword'] = async rawPassword => {
    const saltRounds = process.env.SALT_ROUNDS
    if (saltRounds === undefined) {
        throw new Error('SALT_ROUNDS is not defined in .env')
    }
    return await hash(rawPassword, parseInt(saltRounds))
}

const verifyAccessToken: AuthService['verifyAccessToken'] = rawToken => {
    const { TOKEN_SECRET_KEY } = process.env
    if (TOKEN_SECRET_KEY === undefined) {
        throw new Error('TOKEN_SECRET_KEY is not defined in .env')
    }
    const { sub } = verify(rawToken, TOKEN_SECRET_KEY) as JwtPayload
    if (sub === undefined) {
        return null
    } else {
        return {
            id: parseInt(sub)
        }
    }
}

const verifyUser: AuthService['verifyUser'] = async (givenPassword, user) => {
    return compare(givenPassword, user.password)
}

const authService: AuthService = {
    createAccessToken,
    hashPassword,
    verifyAccessToken,
    verifyUser
}

export default authService
