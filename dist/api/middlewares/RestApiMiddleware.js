"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ServerStartedListener_1 = require("../listeners/ServerStartedListener");
let RestApiMiddleware = class RestApiMiddleware {
    constructor(serverStartedListener, Logger) {
        this.serverStartedListener = serverStartedListener;
        this.use = (req, res, next) => {
            if (!this.serverStartedListener.isStarted) {
                return res.failed(503, 'Server not fully started yet, is particld running?');
            }
            next();
        };
        this.log = new Logger(__filename);
    }
};
RestApiMiddleware = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Listener)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Listener.ServerStartedListener)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ServerStartedListener_1.ServerStartedListener, Object])
], RestApiMiddleware);
exports.RestApiMiddleware = RestApiMiddleware;
//# sourceMappingURL=RestApiMiddleware.js.map