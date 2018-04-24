"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageInfoRepository_1 = require("../repositories/MessageInfoRepository");
const MessageInfoCreateRequest_1 = require("../requests/MessageInfoCreateRequest");
const MessageInfoUpdateRequest_1 = require("../requests/MessageInfoUpdateRequest");
let MessageInfoService = class MessageInfoService {
    constructor(messageInfoRepo, Logger) {
        this.messageInfoRepo = messageInfoRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.messageInfoRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageInfo = yield this.messageInfoRepo.findOne(id, withRelated);
            if (messageInfo === null) {
                this.log.warn(`MessageInfo with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return messageInfo;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('messageinfo body:', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the messageInfo
            const messageInfo = yield this.messageInfoRepo.create(body);
            // finally find and return the created messageInfo
            const newMessageInfo = yield this.findOne(messageInfo.id);
            return newMessageInfo;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const messageInfo = yield this.findOne(id, false);
            // set new values
            messageInfo.Address = body.address;
            messageInfo.Memo = body.memo;
            // update messageInfo record
            const updatedMessageInfo = yield this.messageInfoRepo.update(id, messageInfo.toJSON());
            const newMessageInfo = yield this.findOne(id);
            return newMessageInfo;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.messageInfoRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(MessageInfoCreateRequest_1.MessageInfoCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [MessageInfoCreateRequest_1.MessageInfoCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageInfoService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(MessageInfoUpdateRequest_1.MessageInfoUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, MessageInfoUpdateRequest_1.MessageInfoUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageInfoService.prototype, "update", null);
MessageInfoService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.MessageInfoRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessageInfoRepository_1.MessageInfoRepository, Object])
], MessageInfoService);
exports.MessageInfoService = MessageInfoService;
//# sourceMappingURL=MessageInfoService.js.map