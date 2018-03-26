import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ServerStartedListener } from '../listeners/ServerStartedListener';

export class RestApiMiddleware implements interfaces.Middleware {

    public log: LoggerType;

    constructor(
        @inject(Types.Listener) @named(Targets.Listener.ServerStartedListener) private serverStartedListener: ServerStartedListener,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public use = (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void => {

        if (!this.serverStartedListener.isStarted) {
            return res.failed(503, 'Server not fully started yet, is particld running?');
        }

        next();
    }

}
