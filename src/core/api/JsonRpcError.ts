// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE


import {JsonRpc2ResponseError, RpcErrorCode} from './jsonrpc';

export class JsonRpcError extends Error implements JsonRpc2ResponseError {

    public code: number;
    public message: string;
    public data: any;

    constructor(code: number = RpcErrorCode.InternalError, message: string, data?: any) {
        super(message);
        this.name = 'JsonRpcError';
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public toJSON(): JsonRpc2ResponseError {
        const json: JsonRpc2ResponseError = {
            code: Number(this.code),
            message: String(this.message)
        };
        if (this.data !== undefined) {
            json.data = this.data;
        }
        return json;
    }
}
