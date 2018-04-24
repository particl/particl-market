import { JsonRpc2ResponseError } from './jsonrpc';
export declare class JsonRpcError extends Error implements JsonRpc2ResponseError {
    code: number;
    message: string;
    data: any;
    constructor(code: number | undefined, message: string, data?: any);
    toJSON(): JsonRpc2ResponseError;
}
