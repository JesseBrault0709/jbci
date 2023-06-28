import fs from 'fs/promises'
import path from 'path'
import Logger, { combinePrinters, getDefaultConsolePrinter, getDefaultFormatter } from './Logger'

const getLogger = async (logsDir: string): Promise<Logger> => {
    try {
        await fs.mkdir(path.join(process.cwd(), 'logs'))
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            console.error(err)
        }
    }

    const logFile = await fs.open(path.join(logsDir, 'index.log'), 'a')

    return new Logger(
        combinePrinters(getDefaultConsolePrinter(), async s => {
            await logFile.write(`${s}\n`)
        }),
        getDefaultFormatter()
    )
}

export default getLogger
