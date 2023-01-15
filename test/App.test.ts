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

    it('should return 200 OK when POST /testRepository and echo into scriptLog', async () => {
        const secret = 'Some secret which will be shared.'

        const config: Config = {
            repository: 'testRepository',
            secret,
            on: [
                {
                    action: 'push',
                    script: 'test.sh'
                }
            ]
        }

        const app = getApp(logger, [config], scriptRunner)

        const payload = '{"action": "push"}'

        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const response = await request(app)
            .post('/testRepository')
            .set('X-Hub-Signature-256', `sha256=${signature}`)
            .send(payload)

        expect(response.statusCode).toBe(200)

        const logFileText = (
            await fs.readFile(path.join(scriptLogsDir, 'test.sh.log'))
        ).toString()

        expect(logFileText).toBe('Hello!\n') // echo appends newline
    })
})
