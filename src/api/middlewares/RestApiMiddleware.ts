import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core } from '../../constants';


export class RestApiMiddleware implements interfaces.Middleware {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public use = (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void => {
        // TODO: we don't really use the rest api for anything else than testing,
        // so block requests from elsewhere than localhost
        next();
    }

}
