import { inject, named } from 'inversify';
import { controller, httpPost, response, requestBody } from 'inversify-express-utils';
import { app } from '../../app';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { JsonRpc2Request, JsonRpc2Response, RpcErrorCode } from '../../core/api/jsonrpc';
import { JsonRpcError } from '../../core/api/JsonRpcError';

import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { RpcRequest } from '../requests/RpcRequest';
import { CommandEnumType } from '../commands/CommandEnumType';

// Get middlewares
const rpc = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RpcMiddleware);
let rpcIdCount = 0;

@controller('/rpc', rpc.use)
export class RpcController {

    private log: LoggerType;
    private VERSION = '2.0';
    private MAX_INT32 = 2147483647;
    private commands: CommandEnumType = new CommandEnumType();

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.RpcCommandFactory) private rpcCommandFactory: RpcCommandFactory
    ) {
        this.log = new Logger(__filename);
    }

    @httpPost('/')
    public async handleRPC( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {

        const rpcRequest = this.createRequest(body.method, body.params, body.id);
        this.log.debug('controller.handleRPC() rpcRequest:', JSON.stringify(rpcRequest, null, 2));

        // get the commandType for the method name
        const commandType = this.commands.byPropName(body.method);
        // ... use the commandType to get the correct RpcCommand implementation and execute
        const result = await this.rpcCommandFactory.get(commandType).execute(rpcRequest);
        return this.createResponse(rpcRequest.id, result);
    }

    private createRequest(method: string, params?: any, id?: string | number): RpcRequest {
        if (id === null || id === undefined) {
            id = this.generateId();
        } else if (typeof (id) !== 'number') {
            id = String(id);
        }
        return new RpcRequest({ jsonrpc: this.VERSION, method: method.toLowerCase(), params, id });
    }

    private createResponse(id: string | number = '', result?: any, error?: any): JsonRpc2Response {
        if (error) {
            return { id, jsonrpc: this.VERSION, error };
        } else {
            return { id, jsonrpc: this.VERSION, result };
        }
    }

    private generateId(): number {
        if (rpcIdCount >= this.MAX_INT32) {
            rpcIdCount = 0;
        }
        return ++rpcIdCount;
    }

    private getErrorMessage(code: number): string {
        switch (code) {
            case RpcErrorCode.ParseError:
                return 'Parse error';
            case RpcErrorCode.InvalidRequest:
                return 'Invalid Request';
            case RpcErrorCode.MethodNotFound:
                return 'Method not found';
            case RpcErrorCode.InvalidParams:
                return 'Invalid params';
            case RpcErrorCode.InternalError:
                return 'Internal error';
        }
        return 'Unknown Error';
    }
}
