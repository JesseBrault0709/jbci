import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import App from '../src/App'
import { Config } from '../src/Config'
import Logger from '../src/Logger'
import http from 'http'
import crypto from 'crypto'

describe('App tests', () => {
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

    let app: App

    beforeEach(async () => {
        const scriptsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scripts-'))
        const scriptLogsDir = await fs.mkdtemp(
            path.join(os.tmpdir(), 'script-logs-')
        )

        const script = `
            #!/bin/bash

            echo "Hello!"
        `

        const scriptPath = path.join(scriptsDir, 'test.sh')
        await fs.writeFile(scriptPath, script)
        await fs.chmod(scriptPath, '500')

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

        app = new App(logger, 4001, configs, scriptsDir, scriptLogsDir)
        app.start()
    })

    afterEach(() => {
        app.stop()
    })

    it('should return 200 OK', done => {
        const payload = '{"greeting": "Hello!"}'
        const hmac = crypto.createHmac('sha256', 'secret', {
            encoding: 'hex'
        })
        hmac.update(payload)
        const signature = hmac.digest().toString('hex')

        const req = http.request('http://localhost:4001/test/push', {
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
                done()
            } catch (err) {
                done(err)
            }
        })
        req.on('error', done)
        req.end()
    })
})
