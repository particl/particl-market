"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const EscrowRatioRepository_1 = require("../repositories/EscrowRatioRepository");
const EscrowRatioCreateRequest_1 = require("../requests/EscrowRatioCreateRequest");
const EscrowRatioUpdateRequest_1 = require("../requests/EscrowRatioUpdateRequest");
let EscrowRatioService = class EscrowRatioService {
    constructor(escrowRatioRepo, Logger) {
        this.escrowRatioRepo = escrowRatioRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.escrowRatioRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrowRatio = yield this.escrowRatioRepo.findOne(id, withRelated);
            if (escrowRatio === null) {
                this.log.warn(`EscrowRatio with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return escrowRatio;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the escrowRatio
            const escrowRatio = yield this.escrowRatioRepo.create(body);
            // finally find and return the created escrowRatio
            const newEscrowRatio = yield this.findOne(escrowRatio.Id);
            return newEscrowRatio;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const escrowRatio = yield this.findOne(id, false);
            // set new values
            escrowRatio.Buyer = body.buyer;
            escrowRatio.Seller = body.seller;
            // update escrowRatio record
            const updatedEscrowRatio = yield this.escrowRatioRepo.update(id, escrowRatio.toJSON());
            return updatedEscrowRatio;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.escrowRatioRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(EscrowRatioCreateRequest_1.EscrowRatioCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [EscrowRatioCreateRequest_1.EscrowRatioCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowRatioService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(EscrowRatioUpdateRequest_1.EscrowRatioUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, EscrowRatioUpdateRequest_1.EscrowRatioUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowRatioService.prototype, "update", null);
EscrowRatioService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.EscrowRatioRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [EscrowRatioRepository_1.EscrowRatioRepository, Object])
], EscrowRatioService);
exports.EscrowRatioService = EscrowRatioService;
//# sourceMappingURL=EscrowRatioService.js.map