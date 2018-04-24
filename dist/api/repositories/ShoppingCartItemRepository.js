"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ShoppingCartItemRepository = class ShoppingCartItemRepository {
    constructor(ShoppingCartItemModel, Logger) {
        this.ShoppingCartItemModel = ShoppingCartItemModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ShoppingCartItemModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShoppingCartItemModel.fetchById(id, withRelated);
        });
    }
    findOneByListingItemOnCart(cartId, listingItemId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShoppingCartItemModel.findOneByListingItemOnCart(cartId, listingItemId);
        });
    }
    findListItemsByCartId(cartId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShoppingCartItemModel.findListItemsByCartId(cartId);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCartItem = this.ShoppingCartItemModel.forge(data);
            try {
                const shoppingCartItemCreated = yield shoppingCartItem.save();
                return this.ShoppingCartItemModel.fetchById(shoppingCartItemCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the shoppingCartItem!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCartItem = this.ShoppingCartItemModel.forge({ id });
            try {
                const shoppingCartItemUpdated = yield shoppingCartItem.save(data, { patch: true });
                return this.ShoppingCartItemModel.fetchById(shoppingCartItemUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the shoppingCartItem!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let shoppingCartItem = this.ShoppingCartItemModel.forge({ id });
            try {
                shoppingCartItem = yield shoppingCartItem.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield shoppingCartItem.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the shoppingCartItem!', error);
            }
        });
    }
    clearCart(cartId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShoppingCartItemModel.clearCart(cartId);
        });
    }
};
ShoppingCartItemRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ShoppingCartItem)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ShoppingCartItemRepository);
exports.ShoppingCartItemRepository = ShoppingCartItemRepository;
//# sourceMappingURL=ShoppingCartItemRepository.js.map