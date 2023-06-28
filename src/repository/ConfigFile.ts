interface ConfigFile<O extends OnSpec = OnSpec> {
    type: 'github' | 'custom'
    repository: string
    on: ReadonlyArray<O>
}

export interface OnSpec {
    event: string
    script: string
}

export default ConfigFile
