export type Config = {
    repository: string
    secret: string
    on: ReadonlyArray<OnSpec>
}

export type OnSpec = {
    event: string
    ref?: string
    script: string
}
