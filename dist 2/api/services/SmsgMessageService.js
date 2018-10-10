"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const SmsgMessageRepository_1 = require("../repositories/SmsgMessageRepository");
const SmsgMessageCreateRequest_1 = require("../requests/SmsgMessageCreateRequest");
const SmsgMessageUpdateRequest_1 = require("../requests/SmsgMessageUpdateRequest");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
let SmsgMessageService = class SmsgMessageService {
    constructor(smsgMessageRepo, Logger) {
        this.smsgMessageRepo = smsgMessageRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    searchBy(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.smsgMessageRepo.searchBy(options, withRelated);
            // this.log.debug('searchBy, result: ', JSON.stringify(result.toJSON(), null, 2));
            return result;
        });
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.smsgMessageRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const smsgMessage = yield this.smsgMessageRepo.findOne(id, withRelated);
            if (smsgMessage === null) {
                this.log.warn(`SmsgMessage with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return smsgMessage;
        });
    }
    findOneByMsgId(msgId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const smsgMessage = yield this.smsgMessageRepo.findOneByMsgId(msgId, withRelated);
            if (smsgMessage === null) {
                this.log.warn(`SmsgMessage with the msgid=${msgId} was not found!`);
                throw new NotFoundException_1.NotFoundException(msgId);
            }
            return smsgMessage;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create SmsgMessage, body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the smsgMessage
            const smsgMessage = yield this.smsgMessageRepo.create(body);
            // finally find and return the created smsgMessage
            const newSmsgMessage = yield this.findOne(smsgMessage.id);
            return newSmsgMessage;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const smsgMessage = yield this.findOne(id, false);
            // set new values
            smsgMessage.Type = body.type;
            smsgMessage.Status = body.status;
            smsgMessage.Msgid = body.msgid;
            smsgMessage.Version = body.version;
            smsgMessage.Read = body.read;
            smsgMessage.Paid = body.paid;
            smsgMessage.Payloadsize = body.payloadsize;
            smsgMessage.Received = body.received;
            smsgMessage.Sent = body.sent;
            smsgMessage.Expiration = body.expiration;
            smsgMessage.Daysretention = body.daysretention;
            smsgMessage.From = body.from;
            smsgMessage.To = body.to;
            smsgMessage.Text = body.text;
            // update smsgMessage record
            const updatedSmsgMessage = yield this.smsgMessageRepo.update(id, smsgMessage.toJSON());
            // const newSmsgMessage = await this.findOne(id);
            // return newSmsgMessage;
            return updatedSmsgMessage;
        });
    }
    /**
     * update the status of the processed message, clean the text field if processing was successfull
     *
     * @param {module:resources.SmsgMessage} message
     * @param {SmsgMessageStatus} status
     * @returns {Promise<module:resources.SmsgMessage>}
     */
    updateSmsgMessageStatus(message, status) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const text = status === SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED ? '' : message.text;
            const updateRequest = {
                type: message.type.toString(),
                status,
                msgid: message.msgid,
                version: message.version,
                read: message.read,
                paid: message.paid,
                payloadsize: message.payloadsize,
                received: message.received,
                sent: message.sent,
                expiration: message.expiration,
                daysretention: message.daysretention,
                from: message.from,
                to: message.to,
                text
            };
            // this.log.debug('message:', JSON.stringify(message, null, 2));
            // this.log.debug('updateRequest:', JSON.stringify(updateRequest, null, 2));
            return yield this.update(message.id, updateRequest);
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.smsgMessageRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(SmsgMessageCreateRequest_1.SmsgMessageCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [SmsgMessageCreateRequest_1.SmsgMessageCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], SmsgMessageService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(SmsgMessageUpdateRequest_1.SmsgMessageUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, SmsgMessageUpdateRequest_1.SmsgMessageUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], SmsgMessageService.prototype, "update", null);
SmsgMessageService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.SmsgMessageRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [SmsgMessageRepository_1.SmsgMessageRepository, Object])
], SmsgMessageService);
exports.SmsgMessageService = SmsgMessageService;
//# sourceMappingURL=SmsgMessageService.js.map