"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
let TestMessageProcessor = class TestMessageProcessor {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    process(message) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            //
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TestMessageProcessor.prototype, "process", null);
TestMessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], TestMessageProcessor);
exports.TestMessageProcessor = TestMessageProcessor;
//# sourceMappingURL=TestMessageProcessor.js.map