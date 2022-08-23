import fs from 'fs/promises'

export type Level = 'DEBUG' | 'INFO' | 'ERROR'

const getLog = (logFile?: fs.FileHandle) => {
    const ws = logFile?.createWriteStream()
    return (level: Level) => (msg: any) => {
        const date = new Date().toUTCString()
        const s = `${date} ${level} ${msg}`
        if (level === 'DEBUG' && process.env.DEBUG === 'true') {
            console.log(s)
            if (ws !== undefined) {
                ws.write(`${s}\n`)
            }
        } else if (level === 'INFO') {
            console.log(s)
            if (ws !== undefined) {
                ws.write(`${s}\n`)
            }
        } else if (level === 'ERROR') {
            console.error(s)
            if (ws !== undefined) {
                ws.write(`${s}\n`)
            }
        }
    }
}

export type Log = ReturnType<ReturnType<typeof getLog>>

export default getLog
