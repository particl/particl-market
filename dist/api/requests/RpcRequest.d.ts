import { RequestBody } from '../../core/api/RequestBody';
export declare class RpcRequest extends RequestBody {
    id: number;
    jsonrpc: string;
    method: string;
    params: any[];
}
