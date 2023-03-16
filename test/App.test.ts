import crypto from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { Config } from '../src/Config'
import Logger, {
    getDefaultConsolePrinter,
    getDefaultFormatter
} from '../src/Logger'
import ScriptRunner from '../src/ScriptRunner'
import getApp, { GREETING } from '../src/getApp'

describe('app integration tests', () => {
    const logger = new Logger(getDefaultConsolePrinter(), getDefaultFormatter())

    let scriptRunner: ScriptRunner
    let scriptLogsDir: string

    beforeAll(async () => {
        const scriptsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scripts-'))
        scriptLogsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'script-logs-'))

        scriptRunner = new ScriptRunner(logger, scriptsDir, scriptLogsDir)

        const script = `
            #!/bin/bash
            echo "Hello!"
        `

        const scriptPath = path.join(scriptsDir, 'test.sh')
        await fs.writeFile(scriptPath, script)
        await fs.chmod(scriptPath, '500')
    })

    it('should return a greeting when GET /', async () => {
        const app = getApp(logger, [], scriptRunner)

        const response = await request(app).get('/')

        expect(response.text).toBe(GREETING)
        expect(response.statusCode).toBe(200)
    })

    it('should return 200 OK when POST /testRepository', async () => {
        const secret = 'Some secret which will be shared.'

        const config: Config = {
            repository: 'testRepository',
            secret,
            on: [
                {
                    event: 'push',
                    script: 'test.sh'
                }
            ]
        }

        const app = getApp(logger, [config], scriptRunner)

        const payload = '{}'

        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const response = await request(app)
            .post('/testRepository')
            .set('X-Hub-Signature-256', `sha256=${signature}`)
            .set('X-Github-Event', 'push')
            .send(payload)

        expect(response.statusCode).toBe(200)
    })

    it('should return 200 OK when pinged', async () => {
        const secret = 'Some secret to be shared.'
        const config: Config = {
            repository: 'testRepository',
            secret,
            on: []
        }

        const app = getApp(logger, [config], scriptRunner)

        const payload = '{}'

        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const response = await request(app)
            .post('/testRepository')
            .set('X-Hub-Signature-256', `sha256=${signature}`)
            .set('X-Github-Event', 'ping')
            .send(payload)

        expect(response.statusCode).toBe(200)
    })
})
