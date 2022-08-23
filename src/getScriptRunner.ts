import { Config, OnSpec } from './Config'
import { Log } from './getLog'
import util from 'util'
import child_process from 'child_process'
import path from 'path'

const exec = util.promisify(child_process.exec)

const getScriptRunner =
    (infoLog: Log, errorLog: Log) => async (config: Config, onSpec: OnSpec) => {
        if (onSpec.script.endsWith('.sh')) {
            infoLog(`executing script: ${onSpec.script}`)
            try {
                await exec(
                    `${path.join(
                        process.cwd(),
                        'configs',
                        onSpec.script
                    )} &> ${path.join(process.cwd(), config.repository)}.log`
                )
            } catch (err) {
                errorLog(err)
            }
        } else {
            errorLog(`unsupported script type: ${onSpec.script}`)
        }
    }

export default getScriptRunner
