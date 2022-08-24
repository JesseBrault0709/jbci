import child_process from 'child_process'
import path from 'path'
import util from 'util'
import { OnSpec } from './Config'
import Logger from './Logger'

const exec = util.promisify(child_process.exec)

class ScriptRunner {
    constructor(
        private logger: Logger,
        private scriptsDir: string,
        private scriptLogsDir: string
    ) {}

    async runScriptFile(scriptFile: string, scriptLogFile: string) {
        if (scriptFile.endsWith('.sh')) {
            this.logger.info(`executing script: ${scriptFile}`)
            await exec(`${scriptFile} &> ${scriptLogFile}`, { shell: 'bash' })
        } else {
            throw new Error(`unsupported script type: ${scriptFile}`)
        }
    }

    async runOnSpec(onSpec: OnSpec) {
        await this.runScriptFile(
            path.join(this.scriptsDir, onSpec.script),
            path.join(this.scriptLogsDir, `${onSpec.script}.log`)
        )
    }
}

export default ScriptRunner
