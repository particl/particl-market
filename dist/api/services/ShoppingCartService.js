"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ShoppingCartRepository_1 = require("../repositories/ShoppingCartRepository");
const ShoppingCartCreateRequest_1 = require("../requests/ShoppingCartCreateRequest");
const ShoppingCartUpdateRequest_1 = require("../requests/ShoppingCartUpdateRequest");
let ShoppingCartService = class ShoppingCartService {
    constructor(shoppingCartRepo, Logger) {
        this.shoppingCartRepo = shoppingCartRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shoppingCartRepo.findAll();
        });
    }
    findAllByProfile(searchParam) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shoppingCartRepo.findAllByProfile(searchParam);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCart = yield this.shoppingCartRepo.findOne(id, withRelated);
            if (shoppingCart === null) {
                this.log.warn(`ShoppingCart with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return shoppingCart;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the shoppingCart
            const shoppingCart = yield this.shoppingCartRepo.create(body);
            // finally find and return the created shoppingCart
            const newShoppingCart = yield this.findOne(shoppingCart.id);
            return newShoppingCart;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCart = yield this.findOne(id, false);
            shoppingCart.Name = body.name;
            return yield this.shoppingCartRepo.update(id, shoppingCart.toJSON());
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.shoppingCartRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ShoppingCartCreateRequest_1.ShoppingCartCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ShoppingCartUpdateRequest_1.ShoppingCartUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartService.prototype, "update", null);
ShoppingCartService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ShoppingCartRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShoppingCartRepository_1.ShoppingCartRepository, Object])
], ShoppingCartService);
exports.ShoppingCartService = ShoppingCartService;
//# sourceMappingURL=ShoppingCartService.js.map