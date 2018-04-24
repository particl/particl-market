"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageDataRepository_1 = require("../repositories/MessageDataRepository");
const MessageDataCreateRequest_1 = require("../requests/MessageDataCreateRequest");
const MessageDataUpdateRequest_1 = require("../requests/MessageDataUpdateRequest");
let MessageDataService = class MessageDataService {
    constructor(messageDataRepo, Logger) {
        this.messageDataRepo = messageDataRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.messageDataRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageData = yield this.messageDataRepo.findOne(id, withRelated);
            if (messageData === null) {
                this.log.warn(`MessageData with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return messageData;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('messagedata body:', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the messageData
            const messageData = yield this.messageDataRepo.create(body);
            // finally find and return the created messageData
            const newMessageData = yield this.findOne(messageData.id);
            return newMessageData;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const messageData = yield this.findOne(id, false);
            // set new values
            messageData.Msgid = body.msgid;
            messageData.Version = body.version;
            messageData.Received = body.received;
            messageData.Sent = body.sent;
            messageData.From = body.from;
            messageData.To = body.to;
            // update messageData record
            const updatedMessageData = yield this.messageDataRepo.update(id, messageData.toJSON());
            const newMessageData = yield this.findOne(id);
            return newMessageData;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.messageDataRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(MessageDataCreateRequest_1.MessageDataCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [MessageDataCreateRequest_1.MessageDataCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageDataService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(MessageDataUpdateRequest_1.MessageDataUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, MessageDataUpdateRequest_1.MessageDataUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageDataService.prototype, "update", null);
MessageDataService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.MessageDataRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessageDataRepository_1.MessageDataRepository, Object])
], MessageDataService);
exports.MessageDataService = MessageDataService;
//# sourceMappingURL=MessageDataService.js.map