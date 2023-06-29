import { Readable, Writable } from 'stream'

export interface BodyParserEvents<B> {
    close: () => void
    drain: () => void
    error: (err: Error) => void
    finish: () => void
    parsed: (parsedBody: B, rawBody: string) => void
    pipe: (src: Readable) => void
    unpipe: (src: Readable) => void
}

export interface BodyParser<B> {
    emit<E extends keyof BodyParserEvents<B>>(event: E, ...args: Parameters<BodyParserEvents<B>[E]>): boolean
    on<E extends keyof BodyParserEvents<B>>(event: E, listener: BodyParserEvents<B>[E]): this
}

/**
 * TODO: explore Transform instead.
 */
export class BodyParser<B> extends Writable {
    private rawBody = ''

    constructor(map: (rawBody: string) => Promise<B>) {
        super()
        this.on('close', async () => {
            this.emit('parsed', await map(this.rawBody), this.rawBody)
        })
    }

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
        this.rawBody += chunk
        callback()
    }
}
