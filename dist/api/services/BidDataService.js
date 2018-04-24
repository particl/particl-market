"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const BidDataRepository_1 = require("../repositories/BidDataRepository");
const BidDataCreateRequest_1 = require("../requests/BidDataCreateRequest");
const BidDataUpdateRequest_1 = require("../requests/BidDataUpdateRequest");
let BidDataService = class BidDataService {
    constructor(bidDataRepo, Logger) {
        this.bidDataRepo = bidDataRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.bidDataRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidData = yield this.bidDataRepo.findOne(id, withRelated);
            if (bidData === null) {
                this.log.warn(`BidData with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return bidData;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('BidDataCreateRequest: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the bidData
            const bidData = yield this.bidDataRepo.create(body);
            // finally find and return the created bidData
            const newBidData = yield this.findOne(bidData.id);
            return newBidData;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const bidData = yield this.findOne(id, false);
            // set new values
            bidData.DataValue = body.dataValue;
            bidData.DataId = body.dataId;
            // update bidData record
            const updatedBidData = yield this.bidDataRepo.update(id, bidData.toJSON());
            return updatedBidData;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.bidDataRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(BidDataCreateRequest_1.BidDataCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [BidDataCreateRequest_1.BidDataCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidDataService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(BidDataUpdateRequest_1.BidDataUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, BidDataUpdateRequest_1.BidDataUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidDataService.prototype, "update", null);
BidDataService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.BidDataRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [BidDataRepository_1.BidDataRepository, Object])
], BidDataService);
exports.BidDataService = BidDataService;
//# sourceMappingURL=BidDataService.js.map