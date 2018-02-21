import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';

export class RpcMiddleware implements interfaces.Middleware {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public use = (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void => {
        // validate rpc request
        if (this.isValidVersionTwoRequest(req)) {
            next();
        } else {
            return res.failed(400, 'Invalid JSON-RPC 2.0 request');
        }
    }

    public isValidVersionTwoRequest(request: myExpress.Request): boolean {
        return (
            request
            && request.headers
            && request.headers['content-type']
            && request.headers['content-type'].indexOf('application/json') > -1
            && request.body
            && typeof (request.body) === 'object'
            && request.body.jsonrpc === '2.0'
            && typeof (request.body.method) === 'string'
            && (
                typeof (request.body.params) === 'undefined'
                || Array.isArray(request.body.params)
                || (request.body.params && typeof (request.body.params) === 'object')
            )
            && (
                typeof (request.body.id) === 'undefined'
                || typeof (request.body.id) === 'string'
                || typeof (request.body.id) === 'number'
                || request.body.id === null
            )
        );
    }
}
