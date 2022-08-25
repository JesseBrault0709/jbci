import http from 'http'
import { Config } from './Config'
import configureServer from './configureServer'
import Logger from './Logger'
import ScriptRunner from './ScriptRunner'

class App {
    readonly server: http.Server

    constructor(
        private readonly logger: Logger,
        private readonly port: number,
        configs: ReadonlyArray<Config>,
        scriptRunner: ScriptRunner
    ) {
        this.server = http.createServer()
        configureServer({
            configs,
            logger,
            scriptRunner,
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
