import fs from 'fs/promises'
import path from 'path'
import Logger from './Logger'
import BuildScriptRunner from './config/BuildScriptRunner'
import Config, { ConfigSupplier } from './config/Config'
import ConfigFile from './config/ConfigFile'
import { getGithubConfigFactory } from './config/GithubConfig'
import { isGithubConfigFile } from './config/GithubConfigFile'

interface ConfigModule {
    default: ConfigSupplier
}

const getConfigs =
    (logger: Logger, buildScriptRunner: BuildScriptRunner) =>
    async (configsDir: string): Promise<ReadonlyArray<Config>> => {
        const configs: Config[] = []
        const githubConfigFactory = getGithubConfigFactory(buildScriptRunner)
        try {
            const configFiles = await fs.readdir(configsDir)
            for (const configFileName of configFiles) {
                if (configFileName.endsWith('.json')) {
                    const configRawJson = await fs.readFile(path.join(configsDir, configFileName))
                    const configFile: ConfigFile = JSON.parse(configRawJson.toString())
                    if (isGithubConfigFile(configFile)) {
                        configs.push(githubConfigFactory(configFile))
                    } else {
                        throw new Error(`Config files with type 'custom' are not yet supported: ${configFileName}`)
                    }
                } else if (configFileName.endsWith('.js') || configFileName.endsWith('.ts')) {
                    const configFileInConfigDir = path.join(configsDir, configFileName)
                    const modulePath = path.resolve(__dirname, configFileInConfigDir)
                    logger.debug(`configFileInConfigDir: ${configFileInConfigDir}`)
                    logger.debug(`modulePath: ${modulePath}`)
                    const configModule: ConfigModule = await import(modulePath)
                    configs.push(configModule.default(logger, buildScriptRunner))
                }
            }
        } catch (err) {
            logger.error(err)
        }
        return configs
    }

export default getConfigs
