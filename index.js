import fs from 'fs/promises'
import path from 'path'
import http from 'http'
import child_process from 'child_process'
import util from 'util'
import dotenv from 'dotenv'

dotenv.config()

const exec = util.promisify(child_process.exec)

const getLogger = logFile => msg => {
    const date = new Date().toUTCString()
    console.log(`${date} ${msg}`)
    logFile.write(`${date} ${msg}\n`)
}

const getConfigs = async log => {
    try {
        const configFiles = await fs.readdir(
            path.join(process.cwd(), 'configs')
        )
        const configs = []
        for (const configFileName of configFiles) {
            if (configFileName.endsWith('.json')) {
                const configRaw = await fs.readFile(
                    path.join(process.cwd(), 'configs', configFileName)
                )
                configs.push(JSON.parse(configRaw))
            }
        }
        return configs
    } catch (err) {
        log(err)
    }
}

const getRepositoryAndAction = req => {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const segments = url.pathname.split('/')
    // segements[0] is '', segments[1] is repository, segments[2] is action
    const repository = segments[1]
    const action = segments[2]
    return {
        repository,
        action
    }
}

const main = async () => {
    const log = getLogger(await fs.open('./index.log', 'a'))

    const configs = await getConfigs(log)

    configs.forEach(config => {
        log(`loaded config for repository: ${config.repository}`)
    })

    const server = http.createServer(async (req, res) => {
        res.write('thank you')
        res.end()

        const { repository, action } = getRepositoryAndAction(req)

        const config = configs.find(config => config.repository === repository)
        if (config !== undefined) {
            const onSpec = config.on.find(onSpec => onSpec.action === action)
            if (onSpec !== undefined) {
                if (onSpec.script.endsWith('.sh')) {
                    try {
                        await exec(
                            `${path.join(
                                process.cwd(),
                                'configs',
                                onSpec.script
                            )} &> ${path.join(
                                process.cwd(),
                                config.repository
                            )}.log`
                        )
                    } catch (err) {
                        log(err)
                    }
                } else {
                    log(`unsupported script type: ${onSpec.script}`)
                }
            }
        }
    })

    server.listen(parseInt(process.env.PORT), () =>
        log(`listening on port ${process.env.PORT}`)
    )
}

main()
