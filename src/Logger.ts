export type Level = 'DEBUG' | 'INFO' | 'ERROR'

class Logger {
    constructor(
        private print: (s: string, level: Level) => void,
        private format: (date: Date, level: Level, msg: any) => string
    ) {}

    private doLog(level: Level, msg: any) {
        this.print(this.format(new Date(), level, msg), level)
    }

    debug(msg: any) {
        if (process.env.DEBUG === 'true') {
            this.doLog('DEBUG', msg)
        }
    }

    info(msg: any) {
        this.doLog('INFO', msg)
    }

    error(msg: any) {
        this.doLog('ERROR', msg)
    }
}

export default Logger
