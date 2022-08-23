import getConfigs from './getConfigs'
import getLog from './getLog'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('getConfigs tests', () => {
    const errorLog = getLog()('ERROR')

    it('finds test.json and returns it as a Config', async () => {
        const rawConfig = `
            {
                "repository": "test",
                "on": [
                    {
                        "action": "push",
                        "secret": "secret",
                        "script": "script.sh"
                    }
                ]
            }
        `
        const configsDir = await fs.mkdtemp(
            path.join(os.tmpdir(), 'getConfigs-test-')
        )
        await fs.writeFile(path.join(configsDir, 'test.json'), rawConfig)

        const configs = await getConfigs(errorLog)(configsDir)
        expect(configs.length).toBe(1)
        const config = configs[0]
        expect(config.repository).toBe('test')
        expect(config.on.length).toBe(1)
        const onSpec = config.on[0]
        expect(onSpec.action).toBe('push')
        expect(onSpec.secret).toBe('secret')
        expect(onSpec.script).toBe('script.sh')
    })
})
