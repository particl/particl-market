"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ShoppingCartRepository = class ShoppingCartRepository {
    constructor(ShoppingCartModel, Logger) {
        this.ShoppingCartModel = ShoppingCartModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ShoppingCartModel.fetchAll();
            return list;
        });
    }
    findAllByProfile(searchParam) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ShoppingCartModel.fetchAllByProfile(searchParam);
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShoppingCartModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCart = this.ShoppingCartModel.forge(data);
            try {
                const shoppingCartCreated = yield shoppingCart.save();
                return this.ShoppingCartModel.fetchById(shoppingCartCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the shoppingCart!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCart = this.ShoppingCartModel.forge({ id });
            try {
                const shoppingCartUpdated = yield shoppingCart.save(data, { patch: true });
                return this.ShoppingCartModel.fetchById(shoppingCartUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the shoppingCart!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let shoppingCart = this.ShoppingCartModel.forge({ id });
            try {
                shoppingCart = yield shoppingCart.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield shoppingCart.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the shoppingCart!', error);
            }
        });
    }
};
ShoppingCartRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ShoppingCart)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ShoppingCartRepository);
exports.ShoppingCartRepository = ShoppingCartRepository;
//# sourceMappingURL=ShoppingCartRepository.js.map