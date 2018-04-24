"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MarketRepository_1 = require("../repositories/MarketRepository");
const MarketCreateRequest_1 = require("../requests/MarketCreateRequest");
const MarketUpdateRequest_1 = require("../requests/MarketUpdateRequest");
let MarketService = class MarketService {
    constructor(marketRepo, Logger) {
        this.marketRepo = marketRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    getDefault(withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const market = yield this.marketRepo.getDefault(withRelated);
            if (market === null) {
                this.log.warn(`Default Market was not found!`);
                throw new NotFoundException_1.NotFoundException(process.env.DEFAULT_MARKETPLACE_NAME);
            }
            return market;
        });
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.marketRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const market = yield this.marketRepo.findOne(id, withRelated);
            if (market === null) {
                this.log.warn(`Market with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return market;
        });
    }
    findByAddress(address, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.marketRepo.findOneByAddress(address, withRelated);
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the market
            const market = yield this.marketRepo.create(body);
            // finally find and return the created market
            const newMarket = yield this.findOne(market.Id);
            return newMarket;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const market = yield this.findOne(id, false);
            // set new values
            market.Name = body.name;
            market.PrivateKey = body.private_key;
            market.Address = body.address;
            // update market record
            const updatedMarket = yield this.marketRepo.update(id, market.toJSON());
            // return newMarket;
            return updatedMarket;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.marketRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(MarketCreateRequest_1.MarketCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [MarketCreateRequest_1.MarketCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MarketService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(MarketUpdateRequest_1.MarketUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, MarketUpdateRequest_1.MarketUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MarketService.prototype, "update", null);
MarketService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.MarketRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MarketRepository_1.MarketRepository, Object])
], MarketService);
exports.MarketService = MarketService;
//# sourceMappingURL=MarketService.js.map