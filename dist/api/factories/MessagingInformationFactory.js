"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const _ = require("lodash");
const constants_1 = require("../../constants");
let MessagingInformationFactory = class MessagingInformationFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    get(message) {
        const messInfoData = _.map(message, (value) => {
            return _.assign({}, {
                protocol: value['protocol'],
                publicKey: value['public_key']
            });
        });
        return messInfoData;
    }
};
MessagingInformationFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], MessagingInformationFactory);
exports.MessagingInformationFactory = MessagingInformationFactory;
//# sourceMappingURL=MessagingInformationFactory.js.map