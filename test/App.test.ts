import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import request from 'supertest'
import Logger, { getDefaultConsolePrinter, getDefaultFormatter } from '../src/Logger'
import getApp from '../src/getApp'
import getHookCallback from '../src/getHookCallback'
import getServices from '../src/getServices'
import BuildScriptRunner, { getBuildScriptRunner } from '../src/config/BuildScriptRunner'
import Config, { HookCallback } from '../src/config/Config'
import GithubConfig from '../src/config/GithubConfig'
import Services from '../src/services/Services'

describe('app integration tests', () => {
    const logger = new Logger(getDefaultConsolePrinter(), getDefaultFormatter())

    let buildScriptRunner: BuildScriptRunner
    let testDbPath: string
    let prismaClient: PrismaClient
    let services: Services
    let hookCallback: HookCallback

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

        testDbPath = path.join(__dirname, 'test.db')
        const databaseUrl = `file:${testDbPath}`

        execSync(`DATABASE_URL=${databaseUrl} npx prisma db push`)
        prismaClient = new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl
                }
            }
        })
        services = getServices(prismaClient, logger)
        hookCallback = getHookCallback(services)
    })

    afterAll(() => {
        fs.rm(testDbPath)
    })

    it('POST /repositories/testRepository: return 200 and expect BuildHookResult in db', async () => {
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

        const app = getApp(services, logger, [config], hookCallback)

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

        const buildHookResults = await services.hookResultService.getBuilds()
        expect(buildHookResults.length).toBe(1)
        const buildHookResult = buildHookResults[0]
        expect(buildHookResult.resStatusCode).toBe(200)
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
