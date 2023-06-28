import { HookCallback } from './repository/Config'
import * as hr from './repository/HookResult'
import Services from './services/Services'
import { buildDbProgress } from './services/buildDbStatuses'

const getHookCallback = (services: Services): HookCallback => {
    return async hookResult => {
        if (hr.isEmptySuccess(hookResult)) {
            services.hookResultService.saveEmptySuccess(hookResult)
        } else if (hr.isBuild(hookResult)) {
            const { build } = hookResult
            const { buildId } = await services.hookResultService.saveBuild(hookResult)

            build.on('log', async (level, msg) => {
                const dbBuild = await services.buildService.getBuild(buildId)
                if (dbBuild === null) {
                    throw new Error(`dbBuild is null`)
                }
                await services.buildService.updateBuild(buildId, {
                    log: (dbBuild.log ?? '') + msg
                })
            })

            build.on('completed', completionStatus => {
                services.buildService.updateBuild(buildId, {
                    finished: new Date(Date.now()),
                    progress: buildDbProgress.COMPLETED,
                    completionStatus
                })
            })
        } else if (hr.isFailure(hookResult)) {
            services.hookResultService.saveFailure(hookResult)
        }
    }
}

export default getHookCallback
