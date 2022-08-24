import http from 'http'
import { Config } from './Config'
import configureServer from './configureServer'
import Logger from './Logger'

class App {
    private readonly server: http.Server

    constructor(
        private readonly logger: Logger,
        private readonly port: number,
        configs: ReadonlyArray<Config>,
        scriptsDir: string,
        scriptLogsDir: string
    ) {
        this.server = http.createServer()
        configureServer({
            configs,
            logger,
            scriptLogsDir,
            scriptsDir,
            server: this.server
        })
    }

    start() {
        this.server.listen(this.port, () => {
            this.logger.info(`server listening on port ${this.port}`)
        })
    }

    stop() {
        this.server.close(err => {
            if (err !== undefined) {
                this.logger.error(err)
            }
        })
    }
}

export default App
