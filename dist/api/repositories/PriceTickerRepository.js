"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let PriceTickerRepository = class PriceTickerRepository {
    constructor(PriceTickerModel, Logger) {
        this.PriceTickerModel = PriceTickerModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.PriceTickerModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.PriceTickerModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const priceTicker = this.PriceTickerModel.forge(data);
            try {
                const priceTickerCreated = yield priceTicker.save();
                return this.PriceTickerModel.fetchById(priceTickerCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the priceTicker!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const priceTicker = this.PriceTickerModel.forge({ id });
            try {
                const priceTickerUpdated = yield priceTicker.save(data, { patch: true });
                return this.PriceTickerModel.fetchById(priceTickerUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the priceTicker!', error);
            }
        });
    }
    getOneBySymbol(currency) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.PriceTickerModel.getOneBySymbol(currency);
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let priceTicker = this.PriceTickerModel.forge({ id });
            try {
                priceTicker = yield priceTicker.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield priceTicker.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the priceTicker!', error);
            }
        });
    }
};
PriceTickerRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.PriceTicker)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], PriceTickerRepository);
exports.PriceTickerRepository = PriceTickerRepository;
//# sourceMappingURL=PriceTickerRepository.js.map