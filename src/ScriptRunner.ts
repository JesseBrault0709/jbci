import { exec } from 'child_process'
import path from 'path'
import { OnSpec } from './config/Config'
import Logger from './Logger'

class ScriptRunner {
    constructor(private logger: Logger, private scriptsDir: string, private scriptLogsDir: string) {}

    runScriptFile(scriptFile: string, scriptLogFile: string) {
        if (scriptFile.endsWith('.sh')) {
            this.logger.info(`executing script: ${scriptFile}`)
            exec(
                `${scriptFile} &> ${scriptLogFile}`,
                {
                    env: process.env,
                    shell: 'bash'
                },
                err => {
                    if (err) {
                        this.logger.error(err)
                    }
                }
            )
        } else {
            throw new Error(`unsupported script type: ${scriptFile}`)
        }
    }

    runOnSpec(onSpec: OnSpec) {
        this.runScriptFile(
            path.join(this.scriptsDir, onSpec.script),
            path.join(this.scriptLogsDir, `${onSpec.script}.log`)
        )
    }
}

export default ScriptRunner
