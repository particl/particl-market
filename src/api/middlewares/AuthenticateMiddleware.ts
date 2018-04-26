import { inject, named } from 'inversify';
import * as Request from 'request';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core } from '../../constants';

export class AuthenticateMiddleware implements interfaces.Middleware {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType,
        @inject(Types.Lib) @named('request') private request: typeof Request
    ) {
        this.log = new Logger(__filename);
    }

    public use = (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void => {

        if (process.env.MARKET_RPC_AUTH_DISABLED) {
            return next();
        } else {
            if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
                const authentication = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
                // this.log.debug('auth:' + authentication + '===' + process.env.MARKET_RPC_USER + ':' + process.env.MARKET_RPC_PASSWORD);

                if (authentication === process.env.MARKET_RPC_USER + ':' + process.env.MARKET_RPC_PASSWORD) {
                    return next();
                } else {
                    return res.failed(401, 'You are not allowed to request this resource!');
                }
            } else {
                return res.failed(401, 'You are not allowed to request this resource!');
            }
        }
    }
}
