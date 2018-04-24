import { Exception } from '../api/Exception';
export declare const exceptionHandler: (error: Error | Exception, req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction) => void;
