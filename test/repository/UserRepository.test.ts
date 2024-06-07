import { Database } from 'sqlite3'
import initDatabase from '../../src/repository/initDatabase'
import getUserRepository, { UserRepository } from '../../src/repository/UserRepository'
import User from '../../src/model/User'

describe('UserRepository tests', () => {
    let db: Database
    let userRepository: UserRepository

    beforeEach(async () => {
        db = new Database(':memory:', err => {
            if (err !== null) {
                fail(err)
            }
        })
        await initDatabase(db)
        userRepository = getUserRepository(db)
    })

    afterEach(() => {
        db.close(err => {
            if (err !== null) {
                fail(err)
            }
        })
    })

    const seedUser = async (username?: string): Promise<User> => {
        return await userRepository.create({
            username: username ?? 'hello',
            password: 'world'
        })
    }

    it('Should create and return new User', async () => {
        const user = await userRepository.create({
            username: 'hello',
            password: 'world'
        })
        expect(user.username).toBe('hello')
        expect(user.password).toBe('world')
    })

    it('Should delete a User.', async () => {
        const user = await seedUser()
        await userRepository.delete(user.id)
        expect(await userRepository.find(user.id)).toBeNull()
    })

    it('Should find a user.', async () => {
        const { id } = await seedUser()
        const user = await userRepository.find(id)
        expect(user).not.toBeNull()
    })

    it('Should find many Users.', async () => {
        await seedUser('user0')
        await seedUser('user1')
        const users = await userRepository.findMany()
        expect(users.length).toBe(2)
    })

    it('Should update a User username and password.', async () => {
        const { id } = await seedUser()
        const updatedUser = await userRepository.update(id, {
            username: 'newUsername',
            password: 'newPassword'
        })
        expect(updatedUser.username).toBe('newUsername')
        expect(updatedUser.password).toBe('newPassword')
    })

    it('Should update a User only username.', async () => {
        const { id } = await seedUser()
        const updatedUser = await userRepository.update(id, {
            username: 'newUsername'
        })
        expect(updatedUser.username).toBe('newUsername')
        expect(updatedUser.password).toBe('world')
    })
})
