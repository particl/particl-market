"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ProposalMessageType_1 = require("../enums/ProposalMessageType");
const MessageBody_1 = require("../../core/api/MessageBody");
const class_validator_1 = require("class-validator");
const BidMessageType_1 = require("../enums/BidMessageType");
class ProposalMessage extends MessageBody_1.MessageBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(BidMessageType_1.BidMessageType),
    tslib_1.__metadata("design:type", String)
], ProposalMessage.prototype, "action", void 0);
exports.ProposalMessage = ProposalMessage;
//# sourceMappingURL=ProposalMessage.js.map