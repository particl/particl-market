"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const EscrowRepository_1 = require("../repositories/EscrowRepository");
const EscrowCreateRequest_1 = require("../requests/EscrowCreateRequest");
const EscrowUpdateRequest_1 = require("../requests/EscrowUpdateRequest");
const EscrowRatioService_1 = require("../services/EscrowRatioService");
const AddressService_1 = require("../services/AddressService");
let EscrowService = class EscrowService {
    constructor(escrowRepo, escrowRatioService, addressService, Logger) {
        this.escrowRepo = escrowRepo;
        this.escrowRatioService = escrowRatioService;
        this.addressService = addressService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.escrowRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrow = yield this.escrowRepo.findOne(id, withRelated);
            if (escrow === null) {
                this.log.warn(`Escrow with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return escrow;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            const escrowRatio = body.ratio;
            delete body.ratio;
            // If the request body was valid we will create the escrow
            const escrow = yield this.escrowRepo.create(body);
            // create related models, escrowRatio
            if (!_.isEmpty(escrowRatio)) {
                escrowRatio.escrow_id = escrow.Id;
                yield this.escrowRatioService.create(escrowRatio);
            }
            // finally find and return the created escrow
            return yield this.findOne(escrow.Id);
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // find the existing one without related
            const escrow = yield this.findOne(id, false);
            // set new values
            escrow.Type = body.type;
            // update escrow record
            const updatedEscrow = yield this.escrowRepo.update(id, escrow.toJSON());
            // find related escrowratio
            let relatedRatio = updatedEscrow.related('Ratio').toJSON();
            // delete it
            yield this.escrowRatioService.destroy(relatedRatio.id);
            // and create new related data
            relatedRatio = body.ratio;
            relatedRatio.escrow_id = id;
            yield this.escrowRatioService.create(relatedRatio);
            // finally find and return the updated escrow
            const newEscrow = yield this.findOne(id);
            return newEscrow;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.escrowRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(EscrowCreateRequest_1.EscrowCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [EscrowCreateRequest_1.EscrowCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(EscrowUpdateRequest_1.EscrowUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, EscrowUpdateRequest_1.EscrowUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowService.prototype, "update", null);
EscrowService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.EscrowRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.EscrowRatioService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [EscrowRepository_1.EscrowRepository,
        EscrowRatioService_1.EscrowRatioService,
        AddressService_1.AddressService, Object])
], EscrowService);
exports.EscrowService = EscrowService;
//# sourceMappingURL=EscrowService.js.map