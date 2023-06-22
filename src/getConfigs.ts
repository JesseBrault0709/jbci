import fs from 'fs/promises'
import path from 'path'
import { Config, ConfigFile } from './config/Config'
import Logger from './Logger'
import ScriptRunner from './ScriptRunner'
import { getGithubConfig, isGithubConfigFile } from './config/GithubConfig'

const getConfigs =
    (logger: Logger, scriptRunner: ScriptRunner) =>
    async (configsDir: string): Promise<ReadonlyArray<Config>> => {
        const configs: Config[] = []
        try {
            const configFiles = await fs.readdir(configsDir)
            for (const configFileName of configFiles) {
                if (configFileName.endsWith('.json')) {
                    const configRawJson = await fs.readFile(
                        path.join(configsDir, configFileName)
                    )
                    const configFile: ConfigFile = JSON.parse(
                        configRawJson.toString()
                    )
                    if (isGithubConfigFile(configFile)) {
                        configs.push(
                            getGithubConfig(logger, scriptRunner)(configFile)
                        )
                    } else {
                        throw new Error(
                            `Config files with type 'custom' are not yet supported: ${configFileName}`
                        )
                    }
                } else if (
                    configFileName.endsWith('.js') ||
                    configFileName.endsWith('.ts')
                ) {
                    configs.push((await import(configFileName)).default)
                }
            }
        } catch (err) {
            logger.error(err)
        }
        return configs
    }

export default getConfigs
