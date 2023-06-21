import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import Logger from '../src/Logger'
import { isGithubConfig } from '../src/config/Config'
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

        const configs = await getConfigs(logger)(configsDir)
        expect(configs.length).toBe(1)
        const config = configs[0]
        if (isGithubConfig(config)) {
            expect(config.repository).toBe('test')
            expect(config.secret).toBe('secret')
            expect(config.on.length).toBe(1)
            const onSpec = config.on[0]
            expect(onSpec.event).toBe('push')
            expect(onSpec.script).toBe('script.sh')
        } else {
            fail(`config is not a github config: ${config}`)
        }
    })
})
