import { inject, named } from 'inversify';
import * as Request from 'request';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core } from '../../constants';
import { events } from '../../core/api/events';
import { UserAuthenticatedListener } from '../listeners/user/UserAuthenticatedListener';
import * as auth from 'basic-auth';

export class AuthenticateMiddleware implements interfaces.Middleware {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType,
        @inject(Types.Lib) @named('request') private request: typeof Request
    ) {
        this.log = new Logger(__filename);
    }

    public use = (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void => {
        const authentication = auth(req);

        if (authentication && this.isAuthenticate(authentication)) {
            return next();
        } else {
            this.log.warn('You are not allowed to request this resource!');
            return res.failed(401, 'You are not allowed to request this resource!');
        }
    }

    private isAuthenticate(authentication: any): boolean {
        const user = authentication.name;
        const password = authentication.pass;
        return (user === process.env.RPCUSER && password === process.env.RPCPASSWORD) ? true : false;
    }
}
