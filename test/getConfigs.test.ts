import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import Logger from '../src/Logger'
import getConfigs from '../src/getConfigs'
import { getBuildScriptRunner } from '../src/repository/BuildScriptRunner'
import GithubConfig from '../src/repository/GithubConfig'

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

    const mockScriptRunner = getBuildScriptRunner('', logger)

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

        const configs = await getConfigs(logger, mockScriptRunner)(configsDir)
        expect(configs.length).toBe(1)
        const config = configs[0]
        if (config instanceof GithubConfig) {
            expect(config.repository).toBe('test')
        } else {
            fail(`config is not an instanceof GithubConfig: ${config}`)
        }
    })
})
