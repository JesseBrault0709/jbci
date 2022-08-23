export type Config = {
    repository: string
    on: ReadonlyArray<OnSpec>
}

export type OnSpec = {
    action: string
    script: string
    secret: string
}
