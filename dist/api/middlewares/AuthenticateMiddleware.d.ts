import * as Request from 'request';
import { Logger as LoggerType } from '../../core/Logger';
export declare class AuthenticateMiddleware implements interfaces.Middleware {
    private request;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, request: typeof Request);
    use: (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction) => void;
}
