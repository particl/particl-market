"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ProposalType_1 = require("../enums/ProposalType");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const HashableObjectType_1 = require("../enums/HashableObjectType");
const MessageException_1 = require("../exceptions/MessageException");
let ProposalFactory = class ProposalFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param {BidMessageType} bidMessageType
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<BidMessage>}
     */
    getMessage(proposalMessageType, proposalTitle, proposalDescription, blockStart, blockEnd, options, senderProfile, itemHash = null) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const submitter = senderProfile.address;
            const optionsList = [];
            let optionId = 0;
            for (const description of options) {
                const option = {
                    optionId,
                    description
                };
                optionsList.push(option);
                optionId++;
            }
            let proposalType = ProposalType_1.ProposalType.PUBLIC_VOTE;
            if (itemHash) {
                proposalType = ProposalType_1.ProposalType.ITEM_VOTE;
            }
            const message = {
                action: proposalMessageType,
                submitter,
                blockStart,
                blockEnd,
                title: proposalTitle,
                description: proposalDescription,
                options: optionsList,
                type: proposalType,
                item: itemHash
            };
            message.hash = ObjectHash_1.ObjectHash.getHash(message, HashableObjectType_1.HashableObjectType.PROPOSAL_MESSAGE);
            // add hashes for the options too
            for (const option of message.options) {
                option.proposalHash = message.hash;
                option.hash = ObjectHash_1.ObjectHash.getHash(option, HashableObjectType_1.HashableObjectType.PROPOSALOPTION_CREATEREQUEST);
            }
            return message;
        });
    }
    /**
     *
     * @param {ProposalMessage} proposalMessage
     * @returns {Promise<ProposalCreateRequest>}
     */
    getModel(proposalMessage, smsgMessage) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalCreateRequest = {
                submitter: proposalMessage.submitter,
                blockStart: proposalMessage.blockStart,
                blockEnd: proposalMessage.blockEnd,
                hash: proposalMessage.hash,
                type: proposalMessage.type,
                title: proposalMessage.title,
                description: proposalMessage.description,
                item: proposalMessage.item,
                expiryTime: smsgMessage.daysretention,
                postedAt: smsgMessage.sent,
                expiredAt: smsgMessage.expiration,
                receivedAt: smsgMessage.received,
                options: proposalMessage.options
            };
            const correctHash = ObjectHash_1.ObjectHash.getHash(proposalCreateRequest, HashableObjectType_1.HashableObjectType.PROPOSAL_CREATEREQUEST);
            if (correctHash !== proposalCreateRequest.hash) {
                throw new MessageException_1.MessageException(`Received proposal hash <${proposalCreateRequest.hash}> doesn't match actual hash <${correctHash}>.`);
            }
            return proposalCreateRequest;
        });
    }
};
ProposalFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], ProposalFactory);
exports.ProposalFactory = ProposalFactory;
//# sourceMappingURL=ProposalFactory.js.map