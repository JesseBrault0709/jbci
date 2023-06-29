import ConfigFile, { OnSpec } from './ConfigFile'

export interface GithubOnSpec extends OnSpec {
    ref?: string
}

interface GithubConfigFile extends ConfigFile<GithubOnSpec> {
    type: 'github'
    secret: string
}

export const isGithubConfigFile = (configFile: ConfigFile): configFile is GithubConfigFile =>
    configFile.type === 'github'

export default GithubConfigFile
