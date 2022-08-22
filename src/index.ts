#!/usr/bin/env node

import dotenv from 'dotenv'
import util from 'util'
import child_process from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import http from 'http'
import { Buffer } from 'buffer'

// populate process.env with .env variables
dotenv.config()

// Check env variables
if (process.env.PORT === undefined) {
    throw new Error('PORT must not be undefined')
}

const exec = util.promisify(child_process.exec)

const getLogger = (logFile: fs.FileHandle) => (msg: any) => {
    const date = new Date().toUTCString()
    console.log(`${date} ${msg}`)
    logFile.write(`${date} ${msg}\n`)
}

type Log = ReturnType<typeof getLogger>

type Config = {
    repository: string
    on?: ReadonlyArray<OnSpec>
}

type OnSpec = {
    action: string
    script: string
    secret: string
}

const getConfigs = async (log: Log) => {
    const configs: Config[] = []
    try {
        const configFiles = await fs.readdir(
            path.join(process.cwd(), 'configs')
        )
        for (const configFileName of configFiles) {
            if (configFileName.endsWith('.json')) {
                const configRawJson = await fs.readFile(
                    path.join(process.cwd(), 'configs', configFileName)
                )
                const config = JSON.parse(configRawJson.toString())
                configs.push(config)
            }
        }
    } catch (err) {
        log(err)
    }
    return configs
}

const getRepositoryAndActionFromUrl = (
    log: Log,
    req: http.IncomingMessage
): { repository: string | undefined; action: string | undefined } => {
    try {
        const url = new URL(req.url ?? '', `https://${req.headers.host}`)
        const segments = url.pathname.split('/')
        // segements[0] is '' (because of starting '/'), segments[1] is repository, segments[2] is action
        segments.pop()
        const repository = segments.pop()
        const action = segments.pop()
        return {
            repository,
            action
        }
    } catch (err) {
        log(err)
    }
    return {
        repository: '',
        action: ''
    }
}

const execScript = async (log: Log, config: Config, onSpec: OnSpec) => {
    if (onSpec.script.endsWith('.sh')) {
        log(`executing script: ${onSpec.script}`)
        try {
            await exec(
                `${path.join(
                    process.cwd(),
                    'configs',
                    onSpec.script
                )} &> ${path.join(process.cwd(), config.repository)}.log`
            )
        } catch (err) {
            log(err)
        }
    } else {
        log(`unsupported script type: ${onSpec.script}`)
    }
}

const main = async () => {
    const log = getLogger(await fs.open('./index.log', 'a'))

    const configs = await getConfigs(log)

    configs.forEach(config => {
        log(`loaded config for repository: ${config.repository}`)
    })

    const server = http.createServer(async (req, res) => {
        log(`received req at: ${req.url}`)
        log(`X-Hub-Signature-256: ${req.headers['x-hub-signature-256']}`)
        const signature = (
            req.headers['x-hub-signature-256'] as string | undefined
        )?.slice(7)
        log(signature)

        const { repository, action } = getRepositoryAndActionFromUrl(log, req)
        const config = configs.find(config => config.repository === repository)
        const onSpec = config?.on?.find(onSpec => onSpec.action === action)

        if (
            signature !== undefined &&
            config !== undefined &&
            onSpec !== undefined
        ) {
            log(
                `signature present and found onSpec for ${repository}/${action}`
            )
            const hmac = crypto.createHmac('sha256', onSpec.secret)

            req.on('data', chunk => {
                hmac.update(chunk)
            })

            req.on('end', () => {
                try {
                    const hmacDigest = hmac.digest('hex')
                    log(hmacDigest)
                    if (
                        crypto.timingSafeEqual(
                            Buffer.from(hmacDigest),
                            Buffer.from(signature)
                        )
                    ) {
                        execScript(log, config, onSpec)
                    } else {
                        log(`digest and signature are not equal`)
                    }
                } catch (err) {
                    log(err)
                }
            })
        }

        res.end('thank you')
    })

    server.listen(parseInt(process.env.PORT as string), () =>
        log(`listening on port ${process.env.PORT}`)
    )
}

main()
