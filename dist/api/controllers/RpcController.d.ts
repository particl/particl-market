import { Logger as LoggerType } from '../../core/Logger';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
export declare class RpcController {
    Logger: typeof LoggerType;
    private rpcCommandFactory;
    private log;
    private VERSION;
    private MAX_INT32;
    constructor(Logger: typeof LoggerType, rpcCommandFactory: RpcCommandFactory);
    handleRPC(res: myExpress.Response, body: any): Promise<any>;
    private createRequest(method, params?, id?);
    private createResponse(id?, result?, error?);
    private generateId();
    private getErrorMessage(code);
}
