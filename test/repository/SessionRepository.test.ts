import { Database } from 'sqlite3'
import User from '../../src/model/User'
import getSessionRepository, { SessionRepository } from '../../src/repository/SessionRepository'
import getUserRepository, { UserRepository } from '../../src/repository/UserRepository'
import initDatabase from '../../src/repository/initDatabase'

describe('SessionRepository tests', () => {
    let db: Database
    let sessionRepository: SessionRepository
    let userRepository: UserRepository

    beforeEach(async () => {
        db = new Database(':memory:', err => {
            if (err !== null) {
                fail(err)
            }
        })
        await initDatabase(db)
        sessionRepository = getSessionRepository(db)
        userRepository = getUserRepository(db)
    })

    afterEach(() => {
        db.close(err => {
            if (err !== null) {
                fail(err)
            }
        })
    })

    const seedUser = (username?: string): Promise<User> =>
        userRepository.create({
            username: username ?? 'hello',
            password: 'world'
        })

    it('Should create and return new Session', async () => {
        const now = new Date()
        const session = await sessionRepository.create({
            sid: 'test',
            created: now
        })
        expect(session.sid).toBe('test')
        expect(session.created.valueOf()).toBe(now.valueOf())
    })

    it('Should create and return new SessionWithUser', async () => {
        const now = new Date()
        const user = await seedUser()
        const sessionWithUser = await sessionRepository.createWithUser({
            sid: 'test',
            created: now,
            userId: user.id
        })
        expect(sessionWithUser.sid).toBe('test')
        expect(sessionWithUser.created.valueOf()).toBe(now.valueOf())
        expect(sessionWithUser.user.id).toBe(user.id)
        expect(sessionWithUser.user.username).toBe(user.username)
        expect(sessionWithUser.user.password).toBe(user.password)
    })

    it('Should delete a Session', async () => {
        const session = await sessionRepository.create({
            sid: 'test',
            created: new Date()
        })
        await sessionRepository.delete(session.id)
        expect(await sessionRepository.find(session.id)).toBeNull()
    })

    it('Should delete all Sessions by User', async () => {
        const { id: userId } = await seedUser()
        const session0 = await sessionRepository.createWithUser({
            sid: 'test0',
            created: new Date(),
            userId
        })
        const session1 = await sessionRepository.createWithUser({
            sid: 'test1',
            created: new Date(),
            userId
        })
        await sessionRepository.deleteByUser(userId)
        expect(await sessionRepository.find(session0.id)).toBeNull()
        expect(await sessionRepository.find(session1.id)).toBeNull()
    })

    it('Should find a Session when present', async () => {
        const seedSession = await sessionRepository.create({
            sid: 'test',
            created: new Date()
        })
        const foundSession = await sessionRepository.find(seedSession.id)
        expect(foundSession).not.toBeNull()
        expect(foundSession!.id).toBe(seedSession.id)
        expect(foundSession!.sid).toBe(seedSession.sid)
        expect(foundSession!.created.valueOf()).toBe(seedSession.created.valueOf())
    })

    it('Should find null Session if no Session present', async () => {
        const foundSession = await sessionRepository.find(0)
        expect(foundSession).toBeNull()
    })

    it('Should find SessionWithOptionalUser when present; user present', async () => {
        const user = await seedUser()
        const seedSession = await sessionRepository.createWithUser({
            sid: 'test',
            created: new Date(),
            userId: user.id
        })
        const foundSession = await sessionRepository.findWithUser(seedSession.id)
        expect(foundSession).not.toBeNull()
        expect(foundSession!.id).toBe(seedSession.id)
        expect(foundSession!.sid).toBe(seedSession.sid)
        expect(foundSession!.created.valueOf()).toBe(seedSession.created.valueOf())
        expect(foundSession!.user).not.toBeUndefined()
        expect(foundSession!.user!.id).toBe(user.id)
        expect(foundSession!.user!.username).toBe(user.username)
        expect(foundSession!.user!.password).toBe(user.password)
    })

    it('Should find SessionWithOptionalUser when present; user not present', async () => {
        const seedSession = await sessionRepository.create({
            sid: 'test',
            created: new Date()
        })
        const foundSession = await sessionRepository.findWithUser(seedSession.id)
        expect(foundSession).not.toBeNull()
        expect(foundSession!.id).toBe(seedSession.id)
        expect(foundSession!.sid).toBe(seedSession.sid)
        expect(foundSession!.created.valueOf()).toBe(seedSession.created.valueOf())
        expect(foundSession!.user).toBeUndefined()
    })

    it('Should find Sessions', async () => {
        const session0 = await sessionRepository.create({
            sid: 'test0',
            created: new Date()
        })
        const session1 = await sessionRepository.create({
            sid: 'test1',
            created: new Date()
        })
        const sessions = await sessionRepository.findMany()
        expect(sessions.length).toBe(2)
        expect(sessions).toContainEqual(session0)
        expect(sessions).toContainEqual(session1)
    })

    it('Should infd SessionsWithOptionalUser; mixed Users present', async () => {
        const user = await seedUser()
        const session0 = await sessionRepository.createWithUser({
            sid: 'test0',
            created: new Date(),
            userId: user.id
        })
        const session1 = await sessionRepository.create({
            sid: 'test1',
            created: new Date()
        })
        const sessions = await sessionRepository.findManyWithUser()
        expect(sessions.length).toBe(2)
        expect(sessions).toContainEqual(session0)
        expect(sessions).toContainEqual(session1)
    })

    it('Should find Sessions by User', async () => {
        const user = await seedUser()
        const session = await sessionRepository.createWithUser({
            sid: 'test',
            created: new Date(),
            userId: user.id
        })
        const sessions = await sessionRepository.findManyByUser(user.id)
        expect(sessions.length).toBe(1)
        expect(sessions).toContainEqual(session)
    })

    it('Should update Session', async () => {
        const oldSession = await sessionRepository.create({
            sid: 'test0',
            created: new Date()
        })
        const now = new Date()
        const newSession = await sessionRepository.update(oldSession.id, {
            created: now,
            sid: 'test1'
        })
        expect(newSession.id).toBe(oldSession.id)
        expect(newSession.created.valueOf()).toBe(now.valueOf())
        expect(newSession.sid).toBe('test1')
    })

    it('Should update SessionWithUser and return SessionWithUser', async () => {
        const user = await seedUser()
        const oldSession = await sessionRepository.create({
            sid: 'test0',
            created: new Date()
        })
        const now = new Date()
        const newSession = await sessionRepository.updateWithUser(oldSession.id, {
            sid: 'test1',
            created: now,
            userId: user.id
        })
        expect(newSession.id).toBe(oldSession.id)
        expect(newSession.sid).toBe('test1')
        expect(newSession.created.valueOf()).toBe(now.valueOf())
        expect(newSession.user).not.toBeUndefined()
        expect(newSession.user!.id).toBe(user.id)
        expect(newSession.user!.username).toBe(user.username)
        expect(newSession.user!.password).toBe(user.password)
    })
})
