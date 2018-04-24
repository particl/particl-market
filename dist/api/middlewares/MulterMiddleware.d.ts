import { Logger as LoggerType } from '../../core/Logger';
export declare class MulterMiddleware implements interfaces.Middleware {
    log: LoggerType;
    private upload;
    constructor(Logger: typeof LoggerType);
    use: (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction) => void;
    imageFilter: (req: any, file: any, cb: any) => any;
}
