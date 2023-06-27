export type Level = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export type Formatter = (date: Date, level: Level, msg: any) => string

export const getDefaultFormatter = (): Formatter => (date, level, msg) => `${date.toUTCString()} ${level}: ${msg}`

export type Printer = (s: string, level: Level) => void | Promise<void>

export const getDefaultConsolePrinter = (): Printer => (s, level) => {
    if (level === 'ERROR') {
        console.error(s)
    } else {
        console.log(s)
    }
}

export const combinePrinters =
    (...printers: ReadonlyArray<Printer>): Printer =>
    (s, level) =>
        printers.forEach(printer => printer(s, level))

class Logger {
    constructor(
        private print: (s: string, level: Level) => void,
        private format: (date: Date, level: Level, msg: any) => string
    ) {}

    private doLog(level: Level, msg: any) {
        this.print(this.format(new Date(), level, msg), level)
    }

    trace(msg: any) {
        if (process.env.TRACE === 'true') {
            this.doLog('TRACE', msg)
        }
    }

    debug(msg: any) {
        if (process.env.DEBUG === 'true') {
            this.doLog('DEBUG', msg)
        }
    }

    info(msg: any) {
        this.doLog('INFO', msg)
    }

    warn(msg: any) {
        this.doLog('WARN', msg)
    }

    error(msg: any) {
        this.doLog('ERROR', msg)
    }
}

export default Logger
