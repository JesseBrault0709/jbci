import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import App from '../src/App'
import { Config } from '../src/Config'
import Logger from '../src/Logger'
import http from 'http'
import crypto from 'crypto'

describe('App tests', () => {
    if (process.env.PORT === undefined) {
        throw new Error(`process.env.PORT is undefined`)
    }

    const port = parseInt(process.env.PORT)

    const logger = new Logger(
        (s, level) => {
            if (level === 'ERROR') {
                console.error(s)
            } else {
                console.log(s)
            }
        },
        (date, level, msg) => `${date.toUTCString()} ${level}: ${msg}`
    )

    let scriptsDir: string
    let scriptLogsDir: string

    beforeAll(async () => {
        scriptsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scripts-'))
        scriptLogsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'script-logs-'))

        const script = `
            #!/bin/bash

            echo "Hello!"
        `

        const scriptPath = path.join(scriptsDir, 'test.sh')
        await fs.writeFile(scriptPath, script)
        await fs.chmod(scriptPath, '500')
    })

    it('should return 200 OK', done => {
        const configs: ReadonlyArray<Config> = [
            {
                repository: 'test',
                on: [
                    {
                        action: 'push',
                        secret: 'secret',
                        script: 'test.sh'
                    }
                ]
            }
        ]

        const app = new App(logger, port, configs, scriptsDir, scriptLogsDir)
        app.start()

        const payload = '{"greeting": "Hello!"}'
        const hmac = crypto.createHmac('sha256', 'secret', {
            encoding: 'hex'
        })
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const req = http.request(`http://localhost:${port}/test/push`, {
            headers: {
                'Content-Type': 'Application/JSON',
                'Content-Length': Buffer.byteLength(payload),
                'X-Hub-Signature-256': `sha256=${signature}`
            }
        })
        req.write(payload)
        req.on('response', res => {
            try {
                expect(res.statusCode).toBe(200)
                app.stop()
                done()
            } catch (err) {
                app.stop()
                done(err)
            }
        })
        req.on('error', done)
        req.end()
    })
})
