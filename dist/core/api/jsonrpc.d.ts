export interface JsonRpc2Request {
    jsonrpc: string;
    method: string;
    params?: any;
    id?: number | string;
}
export interface JsonRpc2Response {
    jsonrpc: string;
    result?: any;
    error?: JsonRpc2ResponseError;
    id: number | string;
}
export interface JsonRpc2ResponseError {
    code: number;
    message: string;
    data?: any;
}
export declare enum RpcErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
}
