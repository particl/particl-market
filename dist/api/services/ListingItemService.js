"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ListingItemRepository_1 = require("../repositories/ListingItemRepository");
const ListingItemCreateRequest_1 = require("../requests/ListingItemCreateRequest");
const ListingItemUpdateRequest_1 = require("../requests/ListingItemUpdateRequest");
const MessagingInformationService_1 = require("./MessagingInformationService");
const PaymentInformationService_1 = require("./PaymentInformationService");
const ItemInformationService_1 = require("./ItemInformationService");
const ItemCategoryService_1 = require("./ItemCategoryService");
const CryptocurrencyAddressService_1 = require("./CryptocurrencyAddressService");
const MarketService_1 = require("./MarketService");
const ListingItemSearchParams_1 = require("../requests/ListingItemSearchParams");
const ListingItemTemplateService_1 = require("./ListingItemTemplateService");
const ListingItemFactory_1 = require("../factories/ListingItemFactory");
const SmsgService_1 = require("./SmsgService");
const ListingItemObjectService_1 = require("./ListingItemObjectService");
const FlaggedItemService_1 = require("./FlaggedItemService");
const events_1 = require("events");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const HashableObjectType_1 = require("../enums/HashableObjectType");
const ActionMessageService_1 = require("./ActionMessageService");
let ListingItemService = class ListingItemService {
    constructor(marketService, cryptocurrencyAddressService, itemInformationService, itemCategoryService, paymentInformationService, messagingInformationService, listingItemTemplateService, listingItemObjectService, smsgService, flaggedItemService, actionMessageService, listingItemFactory, listingItemRepo, eventEmitter, Logger) {
        this.marketService = marketService;
        this.cryptocurrencyAddressService = cryptocurrencyAddressService;
        this.itemInformationService = itemInformationService;
        this.itemCategoryService = itemCategoryService;
        this.paymentInformationService = paymentInformationService;
        this.messagingInformationService = messagingInformationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.listingItemObjectService = listingItemObjectService;
        this.smsgService = smsgService;
        this.flaggedItemService = flaggedItemService;
        this.actionMessageService = actionMessageService;
        this.listingItemFactory = listingItemFactory;
        this.listingItemRepo = listingItemRepo;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.listingItemRepo.findAll();
        });
    }
    findByCategory(categoryId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('find by category:', categoryId);
            return yield this.listingItemRepo.findByCategory(categoryId);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItem = yield this.listingItemRepo.findOne(id, withRelated);
            if (listingItem === null) {
                this.log.warn(`ListingItem with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return listingItem;
        });
    }
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItem>}
     */
    findOneByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItem = yield this.listingItemRepo.findOneByHash(hash, withRelated);
            if (listingItem === null) {
                this.log.warn(`ListingItem with the hash=${hash} was not found!`);
                throw new NotFoundException_1.NotFoundException(hash);
            }
            return listingItem;
        });
    }
    /**
     * search ListingItems using given ListingItemSearchParams
     *
     * @param {ListingItemSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    search(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // if valid params
            // todo: check whether category is string or number, if string, try to find the Category by key
            return yield this.listingItemRepo.search(options, withRelated);
        });
    }
    /**
     *
     * @param {ListingItemCreateRequest} data
     * @returns {Promise<ListingItem>}
     */
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create ListingItem, body: ', JSON.stringify(body, null, 2));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.LISTINGITEM_CREATEREQUEST);
            // extract and remove related models from request
            const itemInformation = body.itemInformation;
            delete body.itemInformation;
            const paymentInformation = body.paymentInformation;
            delete body.paymentInformation;
            const messagingInformation = body.messagingInformation || [];
            delete body.messagingInformation;
            const listingItemObjects = body.listingItemObjects || [];
            delete body.listingItemObjects;
            const actionMessages = body.actionMessages || [];
            delete body.actionMessages;
            // If the request body was valid we will create the listingItem
            const listingItem = yield this.listingItemRepo.create(body);
            // create related models
            if (!_.isEmpty(itemInformation)) {
                itemInformation.listing_item_id = listingItem.Id;
                yield this.itemInformationService.create(itemInformation);
            }
            if (!_.isEmpty(paymentInformation)) {
                paymentInformation.listing_item_id = listingItem.Id;
                yield this.paymentInformationService.create(paymentInformation);
            }
            for (const msgInfo of messagingInformation) {
                msgInfo.listing_item_id = listingItem.Id;
                yield this.messagingInformationService.create(msgInfo);
            }
            // create listingItemObjects
            for (const object of listingItemObjects) {
                object.listing_item_id = listingItem.Id;
                yield this.listingItemObjectService.create(object);
            }
            // this.log.debug('create actionMessages:', JSON.stringify(actionMessages, null, 2));
            // create actionMessages, only used to create testdata
            for (const actionMessage of actionMessages) {
                actionMessage.listing_item_id = listingItem.Id;
                yield this.actionMessageService.create(actionMessage);
            }
            // finally find and return the created listingItem
            return yield this.findOne(listingItem.Id);
        });
    }
    /**
     *
     * @param {number} id
     * @param {ListingItemUpdateRequest} data
     * @returns {Promise<ListingItem>}
     */
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('updating ListingItem, body: ', JSON.stringify(body, null, 2));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.LISTINGITEM_CREATEREQUEST);
            // find the existing one without related
            const listingItem = yield this.findOne(id, false);
            // set new values
            listingItem.Hash = body.hash;
            // and update the ListingItem record
            const updatedListingItem = yield this.listingItemRepo.update(id, listingItem.toJSON());
            // update related ItemInformation
            // if the related one exists allready, then update. if it doesnt exist, create.
            // and if the related one is missing, then remove.
            let itemInformation = updatedListingItem.related('ItemInformation').toJSON();
            if (!_.isEmpty(body.itemInformation)) {
                if (!_.isEmpty(itemInformation)) {
                    const itemInformationId = itemInformation.id;
                    itemInformation = body.itemInformation;
                    itemInformation.listing_item_id = id;
                    yield this.itemInformationService.update(itemInformationId, itemInformation);
                }
                else {
                    itemInformation = body.itemInformation;
                    itemInformation.listing_item_id = id;
                    yield this.itemInformationService.create(itemInformation);
                }
            }
            else if (!_.isEmpty(itemInformation)) {
                yield this.itemInformationService.destroy(itemInformation.id);
            }
            // update related PaymentInformation
            // if the related one exists allready, then update. if it doesnt exist, create.
            // and if the related one is missing, then remove.
            let paymentInformation = updatedListingItem.related('PaymentInformation').toJSON();
            if (!_.isEmpty(body.paymentInformation)) {
                if (!_.isEmpty(paymentInformation)) {
                    const paymentInformationId = paymentInformation.id;
                    paymentInformation = body.paymentInformation;
                    paymentInformation.listing_item_id = id;
                    yield this.paymentInformationService.update(paymentInformationId, paymentInformation);
                }
                else {
                    paymentInformation = body.paymentInformation;
                    paymentInformation.listing_item_id = id;
                    yield this.paymentInformationService.create(paymentInformation);
                }
            }
            else {
                // empty paymentinfo create request
                if (!_.isEmpty(paymentInformation)) {
                    yield this.paymentInformationService.destroy(paymentInformation.id);
                }
            }
            // MessagingInformation
            const existingMessagingInformations = updatedListingItem.related('MessagingInformation').toJSON() || [];
            const newMessagingInformation = body.messagingInformation || [];
            // delete MessagingInformation if not exist with new params
            for (const msgInfo of existingMessagingInformations) {
                if (!(yield this.checkExistingObject(newMessagingInformation, 'publicKey', msgInfo.publicKey))) {
                    yield this.messagingInformationService.destroy(msgInfo.id);
                }
            }
            // update or create MessagingInformation
            for (const msgInfo of newMessagingInformation) {
                msgInfo.listing_item_id = id;
                const message = yield this.checkExistingObject(existingMessagingInformations, 'publicKey', msgInfo.publicKey);
                if (message) {
                    message.protocol = msgInfo.protocol;
                    message.publicKey = msgInfo.publicKey;
                    yield this.messagingInformationService.update(message.id, msgInfo);
                }
                else {
                    yield this.messagingInformationService.create(msgInfo);
                }
            }
            const newListingItemObjects = body.listingItemObjects || [];
            // find related listingItemObjects
            const existingListingItemObjects = updatedListingItem.related('ListingItemObjects').toJSON() || [];
            // find highestOrderNumber
            const highestOrderNumber = yield this.findHighestOrderNumber(newListingItemObjects);
            const objectsToBeUpdated = [];
            for (const object of existingListingItemObjects) {
                // check if order number is greter than highestOrderNumber then delete
                if (object.order > highestOrderNumber) {
                    yield this.listingItemObjectService.destroy(object.id);
                }
                else {
                    objectsToBeUpdated.push(object);
                }
            }
            // create or update listingItemObjects
            for (const object of newListingItemObjects) {
                object.listing_item_id = id;
                const itemObject = yield this.checkExistingObject(objectsToBeUpdated, 'order', object.order);
                if (itemObject) {
                    yield this.listingItemObjectService.update(itemObject.id, object);
                }
                else {
                    yield this.listingItemObjectService.create(object);
                }
            }
            // finally find and return the updated listingItem
            return yield this.findOne(id);
        });
    }
    updateListingItemTemplateRelation(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('updating ListingItem relation to possible ListingItemTemplate.');
            let listingItem = yield this.findOne(id, false);
            const templateId = yield this.listingItemTemplateService.findOneByHash(listingItem.Hash)
                .then(value => {
                const template = value.toJSON();
                this.log.debug('found ListingItemTemplate with matching hash, id:', template.id);
                return template.id;
            })
                .catch(reason => {
                this.log.debug('matching ListingItemTemplate for ListingItem not found.');
            });
            if (templateId) {
                listingItem.set('listingItemTemplateId', templateId);
                yield this.listingItemRepo.update(id, listingItem.toJSON());
            }
            listingItem = yield this.findOne(id);
            return listingItem;
        });
    }
    /**
     *
     * @param {number} id
     * @returns {Promise<void>}
     */
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemModel = yield this.findOne(id, true);
            if (!listingItemModel) {
                throw new NotFoundException_1.NotFoundException('Item listing does not exist. id = ' + id);
            }
            const listingItem = listingItemModel.toJSON();
            this.log.debug('delete listingItem:', listingItem.id);
            yield this.listingItemRepo.destroy(id);
            // remove related CryptocurrencyAddress if it exists
            if (listingItem.PaymentInformation && listingItem.PaymentInformation.ItemPrice
                && listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress) {
                this.log.debug('delete listingItem cryptocurrencyaddress:', listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.id);
                yield this.cryptocurrencyAddressService.destroy(listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.id);
            }
        });
    }
    /**
     * check if ListingItem already Flagged
     *
     * @param {ListingItem} listingItem
     * @returns {Promise<boolean>}
     */
    isItemFlagged(listingItem) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const flaggedItem = listingItem.related('FlaggedItem').toJSON();
            return _.size(flaggedItem) !== 0;
        });
    }
    /**
     * check if object is exist in a array
     *
     * @param {string[]} objectArray
     * @param {string} fieldName
     * @param {string | number} value
     * @returns {Promise<any>}
     */
    checkExistingObject(objectArray, fieldName, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield _.find(objectArray, (object) => {
                return (object[fieldName] === value);
            });
        });
    }
    /**
     * find highest order number from listingItemObjects
     *
     * @param {string[]} listingItemObjects
     * @returns {Promise<any>}
     */
    findHighestOrderNumber(listingItemObjects) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const highestOrder = yield _.maxBy(listingItemObjects, (itemObject) => {
                return itemObject['order'];
            });
            return highestOrder ? highestOrder['order'] : 0;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemSearchParams_1.ListingItemSearchParams)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemSearchParams_1.ListingItemSearchParams, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemCreateRequest_1.ListingItemCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemCreateRequest_1.ListingItemCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ListingItemUpdateRequest_1.ListingItemUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ListingItemUpdateRequest_1.ListingItemUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemService.prototype, "update", null);
ListingItemService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CryptocurrencyAddressService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.PaymentInformationService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.MessagingInformationService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.ListingItemObjectService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.FlaggedItemService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.ActionMessageService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Factory.ListingItemFactory)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(12, inversify_1.named(constants_1.Targets.Repository.ListingItemRepository)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(13, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(14, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(14, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MarketService_1.MarketService,
        CryptocurrencyAddressService_1.CryptocurrencyAddressService,
        ItemInformationService_1.ItemInformationService,
        ItemCategoryService_1.ItemCategoryService,
        PaymentInformationService_1.PaymentInformationService,
        MessagingInformationService_1.MessagingInformationService,
        ListingItemTemplateService_1.ListingItemTemplateService,
        ListingItemObjectService_1.ListingItemObjectService,
        SmsgService_1.SmsgService,
        FlaggedItemService_1.FlaggedItemService,
        ActionMessageService_1.ActionMessageService,
        ListingItemFactory_1.ListingItemFactory,
        ListingItemRepository_1.ListingItemRepository,
        events_1.EventEmitter, Object])
], ListingItemService);
exports.ListingItemService = ListingItemService;
//# sourceMappingURL=ListingItemService.js.map