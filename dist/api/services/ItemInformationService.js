"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ValidationException_1 = require("../exceptions/ValidationException");
const MessageException_1 = require("../exceptions/MessageException");
const ItemInformationRepository_1 = require("../repositories/ItemInformationRepository");
const ItemInformationCreateRequest_1 = require("../requests/ItemInformationCreateRequest");
const ItemInformationUpdateRequest_1 = require("../requests/ItemInformationUpdateRequest");
const ItemLocationService_1 = require("./ItemLocationService");
const ItemImageService_1 = require("./ItemImageService");
const ShippingDestinationService_1 = require("./ShippingDestinationService");
const ListingItemTemplateRepository_1 = require("../repositories/ListingItemTemplateRepository");
const ItemCategoryService_1 = require("./ItemCategoryService");
let ItemInformationService = class ItemInformationService {
    constructor(itemCategoryService, itemImageService, shippingDestinationService, itemLocationService, itemInformationRepo, listingItemTemplateRepository, Logger) {
        this.itemCategoryService = itemCategoryService;
        this.itemImageService = itemImageService;
        this.shippingDestinationService = shippingDestinationService;
        this.itemLocationService = itemLocationService;
        this.itemInformationRepo = itemInformationRepo;
        this.listingItemTemplateRepository = listingItemTemplateRepository;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemInformationRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = yield this.itemInformationRepo.findOne(id, withRelated);
            if (itemInformation === null) {
                this.log.warn(`ItemInformation with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemInformation;
        });
    }
    findByItemTemplateId(listingItemTemplateId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = yield this.itemInformationRepo.findByItemTemplateId(listingItemTemplateId, withRelated);
            if (itemInformation === null) {
                this.log.warn(`ItemInformation with the listingItemTemplateId=${listingItemTemplateId} was not found!`);
                throw new NotFoundException_1.NotFoundException(listingItemTemplateId);
            }
            return itemInformation;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('body: ', JSON.stringify(body, null, 2));
            // ItemInformation needs to be related to either one
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // extract and remove related models from request
            const itemCategory = body.itemCategory;
            const itemLocation = body.itemLocation;
            const shippingDestinations = body.shippingDestinations || [];
            const itemImages = body.itemImages || [];
            delete body.itemCategory;
            delete body.itemLocation;
            delete body.shippingDestinations;
            delete body.itemImages;
            // get existing item category or create new one
            const existingItemCategory = yield this.getOrCreateItemCategory(itemCategory);
            body.item_category_id = existingItemCategory.Id;
            // ready to save, if the request body was valid, create the itemInformation
            const itemInformation = yield this.itemInformationRepo.create(body);
            // create related models
            if (!_.isEmpty(itemLocation)) {
                itemLocation.item_information_id = itemInformation.Id;
                yield this.itemLocationService.create(itemLocation);
            }
            for (const shippingDestination of shippingDestinations) {
                shippingDestination.item_information_id = itemInformation.Id;
                yield this.shippingDestinationService.create(shippingDestination);
            }
            for (const itemImage of itemImages) {
                itemImage.item_information_id = itemInformation.Id;
                yield this.itemImageService.create(itemImage);
            }
            // finally find and return the created itemInformation
            return yield this.findOne(itemInformation.Id);
        });
    }
    updateWithCheckListingTemplate(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplateId = body.listing_item_template_id;
            const listingItemTemplate = yield this.listingItemTemplateRepository.findOne(listingItemTemplateId);
            const itemInformation = listingItemTemplate.related('ItemInformation').toJSON() || {};
            if (_.isEmpty(itemInformation)) {
                this.log.warn(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
                throw new MessageException_1.MessageException(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
            }
            return this.update(itemInformation.id, body);
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('updating ItemInformation, body: ', JSON.stringify(body, null, 2));
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // find the existing one without related
            const itemInformation = yield this.findOne(id, false);
            // set new values
            itemInformation.Title = body.title;
            itemInformation.ShortDescription = body.shortDescription;
            itemInformation.LongDescription = body.longDescription;
            const itemInfoToSave = itemInformation.toJSON();
            // get existing item category or create new one
            const existingItemCategory = yield this.getOrCreateItemCategory(body.itemCategory);
            itemInfoToSave.item_category_id = existingItemCategory.Id;
            // update itemInformation record
            const updatedItemInformation = yield this.itemInformationRepo.update(id, itemInfoToSave);
            if (body.itemLocation) {
                // find related record and delete it
                let itemLocation = updatedItemInformation.related('ItemLocation').toJSON();
                yield this.itemLocationService.destroy(itemLocation.id);
                // recreate related data
                itemLocation = body.itemLocation;
                itemLocation.item_information_id = id;
                yield this.itemLocationService.create(itemLocation);
            }
            // todo: instead of delete and create, update
            // find related record and delete it
            let shippingDestinations = updatedItemInformation.related('ShippingDestinations').toJSON();
            for (const shippingDestination of shippingDestinations) {
                yield this.shippingDestinationService.destroy(shippingDestination.id);
            }
            // recreate related data
            shippingDestinations = body.shippingDestinations || [];
            for (const shippingDestination of shippingDestinations) {
                shippingDestination.item_information_id = id;
                yield this.shippingDestinationService.create(shippingDestination);
            }
            // find related record and delete it
            let itemImages = updatedItemInformation.related('ItemImages').toJSON() || [];
            for (const itemImage of itemImages) {
                yield this.itemImageService.destroy(itemImage.id);
            }
            // recreate related data
            itemImages = body.itemImages || [];
            for (const itemImage of itemImages) {
                itemImage.item_information_id = id;
                yield this.itemImageService.create(itemImage);
            }
            // finally find and return the updated itemInformation
            const newItemInformation = yield this.findOne(id);
            return newItemInformation;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.itemInformationRepo.destroy(id);
        });
    }
    /**
     * fetch or create the given ItemCategory from db
     * @param itemCategory
     * @returns {Promise<ItemCategory>}
     */
    getOrCreateItemCategory(itemCategory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (itemCategory.key) {
                return yield this.itemCategoryService.findOneByKey(itemCategory.key);
            }
            else if (itemCategory.id) {
                return yield this.itemCategoryService.findOne(itemCategory.id);
            }
            else {
                return yield this.itemCategoryService.create(itemCategory);
            }
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemInformationCreateRequest_1.ItemInformationCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemInformationCreateRequest_1.ItemInformationCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemInformationService.prototype, "create", null);
tslib_1.__decorate([
    tslib_1.__param(0, Validate_1.request(ItemInformationUpdateRequest_1.ItemInformationUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemInformationUpdateRequest_1.ItemInformationUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemInformationService.prototype, "updateWithCheckListingTemplate", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemInformationUpdateRequest_1.ItemInformationUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemInformationUpdateRequest_1.ItemInformationUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemInformationService.prototype, "update", null);
ItemInformationService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemImageService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ShippingDestinationService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ItemLocationService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Repository.ItemInformationRepository)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Repository.ListingItemTemplateRepository)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(6, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemCategoryService_1.ItemCategoryService,
        ItemImageService_1.ItemImageService,
        ShippingDestinationService_1.ShippingDestinationService,
        ItemLocationService_1.ItemLocationService,
        ItemInformationRepository_1.ItemInformationRepository,
        ListingItemTemplateRepository_1.ListingItemTemplateRepository, Object])
], ItemInformationService);
exports.ItemInformationService = ItemInformationService;
//# sourceMappingURL=ItemInformationService.js.map