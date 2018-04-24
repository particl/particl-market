import { Logger as LoggerType } from '../../core/Logger';
import { ServerStartedListener } from '../listeners/ServerStartedListener';
export declare class RestApiMiddleware implements interfaces.Middleware {
    private serverStartedListener;
    log: LoggerType;
    constructor(serverStartedListener: ServerStartedListener, Logger: typeof LoggerType);
    use: (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction) => void;
}
