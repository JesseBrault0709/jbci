import fs from 'fs/promises'
import path from 'path'
import { Config } from './Config'
import Logger from './Logger'

const getConfigs =
    (logger: Logger) =>
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
            logger.error(err)
        }
        return configs
    }

export default getConfigs