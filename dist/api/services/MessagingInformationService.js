"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ValidationException_1 = require("../exceptions/ValidationException");
const MessagingInformationRepository_1 = require("../repositories/MessagingInformationRepository");
const MessagingInformationCreateRequest_1 = require("../requests/MessagingInformationCreateRequest");
const MessagingInformationUpdateRequest_1 = require("../requests/MessagingInformationUpdateRequest");
let MessagingInformationService = class MessagingInformationService {
    constructor(messagingInformationRepo, Logger) {
        this.messagingInformationRepo = messagingInformationRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.messagingInformationRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messagingInformation = yield this.messagingInformationRepo.findOne(id, withRelated);
            if (messagingInformation === null) {
                this.log.warn(`MessagingInformation with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return messagingInformation;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: could this be annotated in MessagingInformationCreateRequest?
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // If the request body was valid we will create the messagingInformation
            const messagingInformation = yield this.messagingInformationRepo.create(body);
            // finally find and return the created messagingInformation
            const newMessagingInformation = yield this.findOne(messagingInformation.Id);
            return newMessagingInformation;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: could this be annotated in MessagingInformationCreateRequest?
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // find the existing one without related
            const messagingInformation = yield this.findOne(id, false);
            // set new values
            messagingInformation.Protocol = body.protocol;
            messagingInformation.PublicKey = body.publicKey;
            // update messagingInformation record
            const updatedMessagingInformation = yield this.messagingInformationRepo.update(id, messagingInformation.toJSON());
            return updatedMessagingInformation;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.messagingInformationRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(MessagingInformationCreateRequest_1.MessagingInformationCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [MessagingInformationCreateRequest_1.MessagingInformationCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessagingInformationService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(MessagingInformationUpdateRequest_1.MessagingInformationUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, MessagingInformationUpdateRequest_1.MessagingInformationUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessagingInformationService.prototype, "update", null);
MessagingInformationService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.MessagingInformationRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessagingInformationRepository_1.MessagingInformationRepository, Object])
], MessagingInformationService);
exports.MessagingInformationService = MessagingInformationService;
//# sourceMappingURL=MessagingInformationService.js.map