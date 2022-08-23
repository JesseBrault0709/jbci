import { Config } from './Config'
import { Log } from './getLog'
import path from 'path'
import fs from 'fs/promises'

const getConfigs =
    (errorLog: Log) =>
    async (configsDir: string): Promise<ReadonlyArray<Config>> => {
        const configs: Config[] = []
        try {
            const configFiles = await fs.readdir(configsDir)
            for (const configFileName of configFiles) {
                if (configFileName.endsWith('.json')) {
                    const configRawJson = await fs.readFile(
                        path.join(configsDir, configFileName)
                    )
                    const config = JSON.parse(configRawJson.toString())
                    configs.push(config)
                }
            }
        } catch (err) {
            errorLog(err)
        }
        return configs
    }

export default getConfigs
