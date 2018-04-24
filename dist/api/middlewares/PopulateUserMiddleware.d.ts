import { Logger as LoggerType } from '../../core/Logger';
import { UserService } from '../services/UserService';
export declare class PopulateUserMiddleware implements interfaces.Middleware {
    private userService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, userService: UserService);
    use: (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction) => void;
}
