import { AuthService } from './authService'
import { SessionService } from './sessionService'
import { UserService } from './userService'

/**
 * A convenience interface for passing around all the services.
 */
interface Services {
    authService: AuthService
    sessionService: SessionService
    userService: UserService
}

export default Services
