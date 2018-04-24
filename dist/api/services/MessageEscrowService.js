"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageEscrowRepository_1 = require("../repositories/MessageEscrowRepository");
const MessageEscrowCreateRequest_1 = require("../requests/MessageEscrowCreateRequest");
const MessageEscrowUpdateRequest_1 = require("../requests/MessageEscrowUpdateRequest");
let MessageEscrowService = class MessageEscrowService {
    constructor(messageEscrowRepo, Logger) {
        this.messageEscrowRepo = messageEscrowRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.messageEscrowRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageEscrow = yield this.messageEscrowRepo.findOne(id, withRelated);
            if (messageEscrow === null) {
                this.log.warn(`MessageEscrow with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return messageEscrow;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('messageescrow body:', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the messageEscrow
            const messageEscrow = yield this.messageEscrowRepo.create(body);
            // finally find and return the created messageEscrow
            const newMessageEscrow = yield this.findOne(messageEscrow.id);
            return newMessageEscrow;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const messageEscrow = yield this.findOne(id, false);
            // set new values
            messageEscrow.Type = body.type;
            messageEscrow.Rawtx = body.rawtx;
            // update messageEscrow record
            const updatedMessageEscrow = yield this.messageEscrowRepo.update(id, messageEscrow.toJSON());
            const newMessageEscrow = yield this.findOne(id);
            return newMessageEscrow;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.messageEscrowRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(MessageEscrowCreateRequest_1.MessageEscrowCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [MessageEscrowCreateRequest_1.MessageEscrowCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageEscrowService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(MessageEscrowUpdateRequest_1.MessageEscrowUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, MessageEscrowUpdateRequest_1.MessageEscrowUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessageEscrowService.prototype, "update", null);
MessageEscrowService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.MessageEscrowRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessageEscrowRepository_1.MessageEscrowRepository, Object])
], MessageEscrowService);
exports.MessageEscrowService = MessageEscrowService;
//# sourceMappingURL=MessageEscrowService.js.map