import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import request from 'supertest'
import Logger, { getDefaultConsolePrinter, getDefaultFormatter } from '../src/Logger'
import getApp from '../src/getApp'
import BuildScriptRunner, { getBuildScriptRunner } from '../src/repository/BuildScriptRunner'
import Config from '../src/repository/Config'
import GithubConfig from '../src/repository/GithubConfig'
import Services from '../src/services/Services'
import getAuthService from '../src/services/authService'
import getSessionService from '../src/services/sessionService'
import getUserService from '../src/services/userService'

describe('app integration tests', () => {
    const logger = new Logger(getDefaultConsolePrinter(), getDefaultFormatter())

    let buildScriptRunner: BuildScriptRunner

    const prismaClient = new PrismaClient()

    const authService = getAuthService(logger)
    const sessionService = getSessionService(prismaClient, logger)
    const userService = getUserService(prismaClient, authService, logger)

    const services: Services = {
        authService,
        sessionService,
        userService
    }

    beforeAll(async () => {
        const scriptsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scripts-'))

        buildScriptRunner = getBuildScriptRunner(scriptsDir, logger)

        const script = `
            #!/bin/bash
            echo "Hello!"
        `

        const scriptPath = path.join(scriptsDir, 'test.sh')
        await fs.writeFile(scriptPath, script)
        await fs.chmod(scriptPath, '500')
    })

    it('should return 200 OK when POST /repositories/testRepository', async () => {
        const secret = 'Some secret which will be shared.'
        const config: Config = new GithubConfig(
            'testRepository',
            secret,
            [
                {
                    event: 'push',
                    script: 'test.sh'
                }
            ],
            buildScriptRunner
        )

        const app = getApp(services, logger, [config], () => {})

        const payload = '{}'

        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const response = await request(app)
            .post('/repositories/testRepository')
            .set('X-Hub-Signature-256', `sha256=${signature}`)
            .set('X-Github-Event', 'push')
            .send(payload)

        expect(response.statusCode).toBe(200)
    })

    it('should return 200 OK when pinged', async () => {
        const secret = 'Some secret to be shared.'
        const config: Config = new GithubConfig('testRepository', secret, [], buildScriptRunner)

        const app = getApp(services, logger, [config], () => {})

        const payload = '{}'

        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const response = await request(app)
            .post('/repositories/testRepository')
            .set('X-Hub-Signature-256', `sha256=${signature}`)
            .set('X-Github-Event', 'ping')
            .send(payload)

        expect(response.statusCode).toBe(200)
    })
})
