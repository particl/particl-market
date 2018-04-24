"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let CurrencyPriceRepository = class CurrencyPriceRepository {
    constructor(CurrencyPriceModel, Logger) {
        this.CurrencyPriceModel = CurrencyPriceModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.CurrencyPriceModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.CurrencyPriceModel.fetchById(id, withRelated);
        });
    }
    /**
     *
     * @param options, CurrencyPriceParams
     * @returns {Promise<CurrencyPrice>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.CurrencyPriceModel.search(options);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currencyPrice = this.CurrencyPriceModel.forge(data);
            try {
                const currencyPriceCreated = yield currencyPrice.save();
                return this.CurrencyPriceModel.fetchById(currencyPriceCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the currencyPrice!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currencyPrice = this.CurrencyPriceModel.forge({ id });
            try {
                const currencyPriceUpdated = yield currencyPrice.save(data, { patch: true });
                return this.CurrencyPriceModel.fetchById(currencyPriceUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the currencyPrice!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let currencyPrice = this.CurrencyPriceModel.forge({ id });
            try {
                currencyPrice = yield currencyPrice.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield currencyPrice.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the currencyPrice!', error);
            }
        });
    }
};
CurrencyPriceRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.CurrencyPrice)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], CurrencyPriceRepository);
exports.CurrencyPriceRepository = CurrencyPriceRepository;
//# sourceMappingURL=CurrencyPriceRepository.js.map