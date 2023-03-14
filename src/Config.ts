export type Config = {
    repository: string
    secret: string
    on: ReadonlyArray<OnSpec>
}

export type OnSpec = {
    event: string
    script: string
}
