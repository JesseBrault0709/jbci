import { exec } from 'child_process'
import path from 'path'
import Logger from '../Logger'
import { Build } from './Build'
import { ChildProcessBuild } from './ChildProcessBuild'

interface BuildScriptRunner {
    toBuild(scriptFile: string): Build | Promise<Build>
}

export const getBuildScriptRunner = (scriptsDir: string, logger: Logger): BuildScriptRunner => ({
    toBuild(scriptFile) {
        if (scriptFile.endsWith('.sh')) {
            logger.info(`getting build for script: ${scriptFile}`)
            const childProcess = exec(`${path.join(scriptsDir, scriptFile)}`, {
                env: process.env,
                shell: 'bash'
            })
            return new ChildProcessBuild(childProcess)
        } else {
            throw new Error(`unsupported script type: ${scriptFile}`)
        }
    }
})

export default BuildScriptRunner
