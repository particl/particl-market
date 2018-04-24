"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageObjectRepository_1 = require("../repositories/MessageObjectRepository");
const MessageObjectCreateRequest_1 = require("../requests/MessageObjectCreateRequest");
const MessageObjectUpdateRequest_1 = require("../requests/MessageObjectUpdateRequest");
let MessageObjectService = class MessageObjectService {
    constructor(messageObjectRepo, Logger) {
        this.messageObjectRepo = messageObjectRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.messageObjectRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageObject = yield this.messageObjectRepo.findOne(id, withRelated);
            if (messageObject === null) {
                this.log.warn(`MessageObject with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return messageObject;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('messageobject body:', JSON.stringify(body, null, 2));
            if (typeof body.dataValue !== 'string') {
                body.dataValue = JSON.stringify(body.dataValue);
            }
            // If the request body was valid we will create the messageObject
            const messageObject = yield this.messageObjectRepo.create(body);
            // finally find and return the created messageObject
            const newMessageObject = yield this.findOne(messageObject.id);
            return newMessageObject;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const messageObject = yield this.findOne(id, false);
            // set new values
            messageObject.DataId = body.dataId;
            messageObject.DataValue = body.dataValue;
            // update messageObject record
            const updatedMessageObject = yield this.messageObjectRepo.update(id, messageObject.toJSON());
            const newMessageObject = yield this.findOne(id);
            return newMessageObject;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.messageObjectRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(MessageObjectCreateRequest_1.MessageObjectCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [MessageObjectCreateRequest_1.MessageObjectCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageObjectService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(MessageObjectUpdateRequest_1.MessageObjectUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, MessageObjectUpdateRequest_1.MessageObjectUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageObjectService.prototype, "update", null);
MessageObjectService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.MessageObjectRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessageObjectRepository_1.MessageObjectRepository, Object])
], MessageObjectService);
exports.MessageObjectService = MessageObjectService;
//# sourceMappingURL=MessageObjectService.js.map