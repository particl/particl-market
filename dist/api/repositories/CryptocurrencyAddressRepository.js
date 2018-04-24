"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let CryptocurrencyAddressRepository = class CryptocurrencyAddressRepository {
    constructor(CryptocurrencyAddressModel, Logger) {
        this.CryptocurrencyAddressModel = CryptocurrencyAddressModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.CryptocurrencyAddressModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.CryptocurrencyAddressModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cryptocurrencyAddress = this.CryptocurrencyAddressModel.forge(data);
            try {
                const cryptocurrencyAddressCreated = yield cryptocurrencyAddress.save();
                return this.CryptocurrencyAddressModel.fetchById(cryptocurrencyAddressCreated.id);
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not create the cryptocurrencyAddress!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cryptocurrencyAddress = this.CryptocurrencyAddressModel.forge({ id });
            try {
                const cryptocurrencyAddressUpdated = yield cryptocurrencyAddress.save(data, { patch: true });
                return this.CryptocurrencyAddressModel.fetchById(cryptocurrencyAddressUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the cryptocurrencyAddress!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let cryptocurrencyAddress = this.CryptocurrencyAddressModel.forge({ id });
            try {
                cryptocurrencyAddress = yield cryptocurrencyAddress.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield cryptocurrencyAddress.destroy();
                return;
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not delete the cryptocurrencyAddress!', error);
            }
        });
    }
};
CryptocurrencyAddressRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.CryptocurrencyAddress)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], CryptocurrencyAddressRepository);
exports.CryptocurrencyAddressRepository = CryptocurrencyAddressRepository;
//# sourceMappingURL=CryptocurrencyAddressRepository.js.map