"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let MarketRepository = class MarketRepository {
    constructor(MarketModel, Logger) {
        this.MarketModel = MarketModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    getDefault(withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.findOneByName(process.env.DEFAULT_MARKETPLACE_NAME, withRelated);
        });
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.MarketModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MarketModel.fetchById(id, withRelated);
        });
    }
    findOneByAddress(address, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MarketModel.fetchByAddress(address, withRelated);
        });
    }
    findOneByName(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MarketModel.fetchByName(name, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const market = this.MarketModel.forge(data);
            try {
                const marketCreated = yield market.save();
                return this.MarketModel.fetchById(marketCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the market!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const market = this.MarketModel.forge({ id });
            try {
                const marketUpdated = yield market.save(data, { patch: true });
                return this.MarketModel.fetchById(marketUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the market!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let market = this.MarketModel.forge({ id });
            try {
                market = yield market.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield market.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the market!', error);
            }
        });
    }
};
MarketRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Market)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MarketRepository);
exports.MarketRepository = MarketRepository;
//# sourceMappingURL=MarketRepository.js.map