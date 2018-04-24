"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageException_1 = require("../exceptions/MessageException");
const ShoppingCartItemRepository_1 = require("../repositories/ShoppingCartItemRepository");
const ShoppingCartItemCreateRequest_1 = require("../requests/ShoppingCartItemCreateRequest");
const ShoppingCartItemUpdateRequest_1 = require("../requests/ShoppingCartItemUpdateRequest");
let ShoppingCartItemService = class ShoppingCartItemService {
    constructor(shoppingCartItemRepo, Logger) {
        this.shoppingCartItemRepo = shoppingCartItemRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shoppingCartItemRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCartItem = yield this.shoppingCartItemRepo.findOne(id, withRelated);
            if (shoppingCartItem === null) {
                this.log.warn(`ShoppingCartItem with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return shoppingCartItem;
        });
    }
    findOneByListingItemOnCart(cartId, listingItemId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.shoppingCartItemRepo.findOneByListingItemOnCart(cartId, listingItemId);
        });
    }
    findListItemsByCartId(cartId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.shoppingCartItemRepo.findListItemsByCartId(cartId);
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // check that listingItems already added or not
            const isItemExistOnCart = yield this.findOneByListingItemOnCart(body.shopping_cart_id, body.listing_item_id);
            if (isItemExistOnCart !== null) {
                this.log.warn(`listing item already exist on shopping cart`);
                throw new MessageException_1.MessageException(`listing item already exist on shopping cart`);
            }
            // If the request body was valid we will create the shoppingCartItem
            const shoppingCartItem = yield this.shoppingCartItemRepo.create(body);
            // finally find and return the created shoppingCartItem
            const newShoppingCartItem = yield this.findOne(shoppingCartItem.id);
            return newShoppingCartItem;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const shoppingCartItem = yield this.findOne(id, false);
            // set new values
            // update shoppingCartItem record
            const updatedShoppingCartItem = yield this.shoppingCartItemRepo.update(id, shoppingCartItem.toJSON());
            // return newShoppingCartItem;
            return updatedShoppingCartItem;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.shoppingCartItemRepo.destroy(id);
        });
    }
    clearCart(cartId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.shoppingCartItemRepo.clearCart(cartId);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ShoppingCartItemCreateRequest_1.ShoppingCartItemCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartItemService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ShoppingCartItemUpdateRequest_1.ShoppingCartItemUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartItemService.prototype, "update", null);
ShoppingCartItemService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ShoppingCartItemRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShoppingCartItemRepository_1.ShoppingCartItemRepository, Object])
], ShoppingCartItemService);
exports.ShoppingCartItemService = ShoppingCartItemService;
//# sourceMappingURL=ShoppingCartItemService.js.map