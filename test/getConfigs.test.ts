import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import Logger from '../src/Logger'
import ScriptRunner from '../src/ScriptRunner'
import { isConfig } from '../src/config/Config'
import GithubConfig from '../src/config/GithubConfig'
import getConfigs from '../src/getConfigs'

describe('getConfigs tests', () => {
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

    const mockScriptRunner = new ScriptRunner(logger, '', '')

    it('finds test.json and returns it as a Config', async () => {
        const rawConfig = `
            {
                "type": "github",
                "repository": "test",
                "secret": "secret",
                "on": [
                    {
                        "event": "push",
                        "script": "script.sh"
                    }
                ]
            }
        `
        const configsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'configs-'))
        await fs.writeFile(path.join(configsDir, 'test.json'), rawConfig)

        const configs = await getConfigs(logger, new ScriptRunner(logger, '', ''))(configsDir)
        expect(configs.length).toBe(1)
        const config = configs[0]
        if (config instanceof GithubConfig) {
            expect(config.repository).toBe('test')
            expect(config.on.length).toBe(1)
            const onSpec = config.on[0]
            expect(onSpec.event).toBe('push')
            expect(onSpec.script).toBe('script.sh')
        } else {
            fail(`config is not an instanceof GithubConfig: ${config}`)
        }
    })

    it('finds testConfig.ts and returns it as a Config', async () => {
        const configsDir = path.join(process.cwd(), 'test', 'configs')
        const configs = await getConfigs(logger, mockScriptRunner)(configsDir)

        expect(configs.length).toBe(1)
        const config = configs[0]
        if (isConfig(config)) {
            expect(config.repository).toBe('testRepository')
        } else {
            fail(`config is not a valid Config: ${config}`)
        }
    })
})
