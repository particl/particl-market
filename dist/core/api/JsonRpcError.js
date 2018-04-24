"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonrpc_1 = require("./jsonrpc");
class JsonRpcError extends Error {
    constructor(code = jsonrpc_1.RpcErrorCode.InternalError, message, data) {
        super(message);
        this.name = 'JsonRpcError';
        this.code = code;
        this.message = message;
        this.data = data;
    }
    toJSON() {
        const json = {
            code: Number(this.code),
            message: String(this.message)
        };
        if (this.data !== undefined) {
            json.data = this.data;
        }
        return json;
    }
}
exports.JsonRpcError = JsonRpcError;
//# sourceMappingURL=JsonRpcError.js.map