import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { Config } from '../src/Config'
import Logger from '../src/Logger'
import ScriptRunner from '../src/ScriptRunner'

describe('script runner tests', () => {
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

    it('runs the script via onSpec, does not throw, and logs to correct file', async () => {
        const config: Config = {
            repository: 'test',
            secret: 'secret',
            on: [
                {
                    action: 'push',
                    script: 'test.sh'
                }
            ]
        }

        const scriptsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scripts-'))
        const scriptLogsDir = await fs.mkdtemp(
            path.join(os.tmpdir(), 'script-logs-')
        )

        const rawScript = `
            #!/bin/bash

            echo "Hello, stdout!"
            echo "Hello, stderr!" >&2
        `

        await fs.writeFile(path.join(scriptsDir, 'test.sh'), rawScript)
        await fs.chmod(path.join(scriptsDir, 'test.sh'), '500')

        const scriptRunner = new ScriptRunner(logger, scriptsDir, scriptLogsDir)

        await expect(
            scriptRunner.runOnSpec(config.on[0])
        ).resolves.toBeUndefined()

        const logData = (
            await fs.readFile(path.join(scriptLogsDir, 'test.sh.log'))
        ).toString()

        expect(logData).toBe('Hello, stdout!\nHello, stderr!\n')
    })

    it('runs the script, does not throw, and logs to correct file', async () => {
        const scriptsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scripts-'))
        const scriptLogsDir = await fs.mkdtemp(
            path.join(os.tmpdir(), 'script-logs-')
        )

        const rawScript = `
            #!/bin/bash

            echo "Hello, stdout!"
            echo "Hello, stderr!" >&2
        `

        await fs.writeFile(path.join(scriptsDir, 'test.sh'), rawScript)
        await fs.chmod(path.join(scriptsDir, 'test.sh'), '500')

        const scriptRunner = new ScriptRunner(logger, scriptsDir, scriptLogsDir)

        await expect(
            scriptRunner.runScriptFile(
                path.join(scriptsDir, 'test.sh'),
                path.join(scriptLogsDir, 'test.sh.log')
            )
        ).resolves.toBeUndefined()

        const logData = (
            await fs.readFile(path.join(scriptLogsDir, 'test.sh.log'))
        ).toString()

        expect(logData).toBe('Hello, stdout!\nHello, stderr!\n')
    })
})
