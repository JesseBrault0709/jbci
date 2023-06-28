import { AuthService } from './authService'
import { BuildService } from './buildService'
import { HookResultService } from './hookResultService'
import { SessionService } from './sessionService'
import { UserService } from './userService'

/**
 * A convenience interface for passing around all the services.
 */
interface Services {
    authService: AuthService
    buildService: BuildService
    hookResultService: HookResultService
    sessionService: SessionService
    userService: UserService
}

export default Services
