"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../../constants");
let UserAuthenticatedListener = class UserAuthenticatedListener {
    constructor(Logger) {
        this.log = new Logger(__filename);
    }
    act(user) {
        this.log.info('Receive event UserAuthenticatedListener', user);
    }
};
UserAuthenticatedListener.Event = Symbol('UserAuthenticatedListener');
UserAuthenticatedListener = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], UserAuthenticatedListener);
exports.UserAuthenticatedListener = UserAuthenticatedListener;
//# sourceMappingURL=UserAuthenticatedListener.js.map