"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ItemPriceRepository_1 = require("../repositories/ItemPriceRepository");
const ItemPriceCreateRequest_1 = require("../requests/ItemPriceCreateRequest");
const ItemPriceUpdateRequest_1 = require("../requests/ItemPriceUpdateRequest");
const ShippingPriceService_1 = require("./ShippingPriceService");
const CryptocurrencyAddressService_1 = require("./CryptocurrencyAddressService");
let ItemPriceService = class ItemPriceService {
    constructor(cryptocurrencyAddressService, shippingpriceService, itemPriceRepo, Logger) {
        this.cryptocurrencyAddressService = cryptocurrencyAddressService;
        this.shippingpriceService = shippingpriceService;
        this.itemPriceRepo = itemPriceRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemPriceRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemPrice = yield this.itemPriceRepo.findOne(id, withRelated);
            if (itemPrice === null) {
                this.log.warn(`ItemPrice with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemPrice;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            const shippingPrice = body.shippingPrice || {};
            const cryptocurrencyAddress = body.cryptocurrencyAddress || {};
            delete body.shippingPrice;
            delete body.cryptocurrencyAddress;
            // create related models, cryptocurrencyAddress
            if (!_.isEmpty(cryptocurrencyAddress)) {
                if (cryptocurrencyAddress.id) {
                    body.cryptocurrency_address_id = cryptocurrencyAddress.id;
                }
                else {
                    const relatedCryAddress = yield this.cryptocurrencyAddressService.create(cryptocurrencyAddress);
                    body.cryptocurrency_address_id = relatedCryAddress.Id;
                }
            }
            // create the itemPrice
            const itemPrice = yield this.itemPriceRepo.create(body);
            // then create shippingPrice
            if (!_.isEmpty(shippingPrice)) {
                shippingPrice.item_price_id = itemPrice.Id;
                yield this.shippingpriceService.create(shippingPrice);
            }
            // finally find and return the created itemPrice
            return yield this.findOne(itemPrice.Id);
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // find the existing one without related
            const itemPrice = yield this.findOne(id, false);
            // set new values
            itemPrice.Currency = body.currency;
            itemPrice.BasePrice = body.basePrice;
            // update itemPrice record
            const updatedItemPrice = yield this.itemPriceRepo.update(id, itemPrice.toJSON());
            // find related ShippingPrice
            let relatedShippingPrice = updatedItemPrice.related('ShippingPrice').toJSON() || {};
            if (!_.isEmpty(relatedShippingPrice)) {
                const shippingPriceId = relatedShippingPrice.id;
                relatedShippingPrice = body.shippingPrice;
                relatedShippingPrice.item_price_id = id;
                yield this.shippingpriceService.update(shippingPriceId, relatedShippingPrice);
            }
            else {
                relatedShippingPrice = body.shippingPrice;
                relatedShippingPrice.item_price_id = id;
                yield this.shippingpriceService.create(relatedShippingPrice);
            }
            // find related CryptocurrencyAddress
            let relatedCryptocurrencyAddress = updatedItemPrice.related('CryptocurrencyAddress').toJSON() || {};
            if (!_.isEmpty(relatedCryptocurrencyAddress)) {
                const cryptocurrencyAddressId = relatedCryptocurrencyAddress.id;
                relatedCryptocurrencyAddress = body.cryptocurrencyAddress;
                relatedCryptocurrencyAddress.item_price_id = id;
                yield this.cryptocurrencyAddressService.update(cryptocurrencyAddressId, relatedCryptocurrencyAddress);
            }
            else {
                relatedCryptocurrencyAddress = body.cryptocurrencyAddress;
                relatedCryptocurrencyAddress.item_price_id = id;
                yield this.cryptocurrencyAddressService.create(relatedCryptocurrencyAddress);
            }
            // finally find and return the updated item price
            const newItemPrice = yield this.findOne(id);
            return newItemPrice;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemPrice = yield this.findOne(id);
            const relatedCryptocurrencyAddress = itemPrice.related('CryptocurrencyAddress').toJSON();
            yield this.itemPriceRepo.destroy(id);
            if (!_.isEmpty(relatedCryptocurrencyAddress.Profile)) {
                yield this.cryptocurrencyAddressService.destroy(relatedCryptocurrencyAddress.Id);
            }
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemPriceCreateRequest_1.ItemPriceCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemPriceCreateRequest_1.ItemPriceCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemPriceService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemPriceUpdateRequest_1.ItemPriceUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemPriceUpdateRequest_1.ItemPriceUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemPriceService.prototype, "update", null);
ItemPriceService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.CryptocurrencyAddressService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ShippingPriceService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Repository.ItemPriceRepository)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [CryptocurrencyAddressService_1.CryptocurrencyAddressService,
        ShippingPriceService_1.ShippingPriceService,
        ItemPriceRepository_1.ItemPriceRepository, Object])
], ItemPriceService);
exports.ItemPriceService = ItemPriceService;
//# sourceMappingURL=ItemPriceService.js.map