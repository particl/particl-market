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
        next();
    }

}
