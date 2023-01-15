export type Config = {
    repository: string
    secret: string
    on: ReadonlyArray<OnSpec>
}

export type OnSpec = {
    action: string
    script: string
}
