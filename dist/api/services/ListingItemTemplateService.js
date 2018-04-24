"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageException_1 = require("../exceptions/MessageException");
const ListingItemTemplateRepository_1 = require("../repositories/ListingItemTemplateRepository");
const ItemInformationService_1 = require("./ItemInformationService");
const PaymentInformationService_1 = require("./PaymentInformationService");
const MessagingInformationService_1 = require("./MessagingInformationService");
const CryptocurrencyAddressService_1 = require("./CryptocurrencyAddressService");
const ListingItemObjectService_1 = require("./ListingItemObjectService");
const ListingItemTemplateSearchParams_1 = require("../requests/ListingItemTemplateSearchParams");
const ListingItemTemplateCreateRequest_1 = require("../requests/ListingItemTemplateCreateRequest");
const ListingItemTemplateUpdateRequest_1 = require("../requests/ListingItemTemplateUpdateRequest");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const HashableObjectType_1 = require("../enums/HashableObjectType");
let ListingItemTemplateService = class ListingItemTemplateService {
    constructor(listingItemTemplateRepo, itemInformationService, paymentInformationService, messagingInformationService, cryptocurrencyAddressService, listingItemObjectService, Logger) {
        this.listingItemTemplateRepo = listingItemTemplateRepo;
        this.itemInformationService = itemInformationService;
        this.paymentInformationService = paymentInformationService;
        this.messagingInformationService = messagingInformationService;
        this.cryptocurrencyAddressService = cryptocurrencyAddressService;
        this.listingItemObjectService = listingItemObjectService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.listingItemTemplateRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplate = yield this.listingItemTemplateRepo.findOne(id, withRelated);
            if (listingItemTemplate === null) {
                this.log.warn(`ListingItemTemplate with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return listingItemTemplate;
        });
    }
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItemTemplate>}
     */
    findOneByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplate = yield this.listingItemTemplateRepo.findOneByHash(hash, withRelated);
            if (listingItemTemplate === null) {
                this.log.warn(`ListingItemTemplate with the hash=${hash} was not found!`);
                throw new NotFoundException_1.NotFoundException(hash);
            }
            return listingItemTemplate;
        });
    }
    /**
     * search ListingItemTemplates using given ListingItemTemplateSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemTemplate>>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.listingItemTemplateRepo.search(options);
        });
    }
    create(data, timestampedHash = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST, timestampedHash);
            // extract and remove related models from request
            const itemInformation = body.itemInformation;
            delete body.itemInformation;
            const paymentInformation = body.paymentInformation;
            delete body.paymentInformation;
            const messagingInformation = body.messagingInformation || [];
            delete body.messagingInformation;
            const listingItemObjects = body.listingItemObjects || [];
            delete body.listingItemObjects;
            this.log.debug('create template, body:', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the listingItemTemplate
            const listingItemTemplate = yield this.listingItemTemplateRepo.create(body);
            // create related models
            if (!_.isEmpty(itemInformation)) {
                itemInformation.listing_item_template_id = listingItemTemplate.Id;
                const result = yield this.itemInformationService.create(itemInformation);
            }
            if (!_.isEmpty(paymentInformation)) {
                paymentInformation.listing_item_template_id = listingItemTemplate.Id;
                const result = yield this.paymentInformationService.create(paymentInformation);
            }
            for (const msgInfo of messagingInformation) {
                msgInfo.listing_item_template_id = listingItemTemplate.Id;
                yield this.messagingInformationService.create(msgInfo);
            }
            for (const object of listingItemObjects) {
                object.listing_item_template_id = listingItemTemplate.Id;
                yield this.listingItemObjectService.create(object);
            }
            // finally find and return the created listingItemTemplate
            return yield this.findOne(listingItemTemplate.Id);
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST);
            // find the existing one without related
            const listingItemTemplate = yield this.findOne(id, false);
            // set new values
            listingItemTemplate.Hash = body.hash;
            // update listingItemTemplate record
            const updatedListingItemTemplate = yield this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());
            // if the related one exists allready, then update. if it doesnt exist, create. and if the related one is missing, then remove.
            // Item-information
            let itemInformation = updatedListingItemTemplate.related('ItemInformation').toJSON() || {};
            if (!_.isEmpty(body.itemInformation)) {
                if (!_.isEmpty(itemInformation)) {
                    const itemInformationId = itemInformation.id;
                    itemInformation = body.itemInformation;
                    itemInformation.listing_item_template_id = id;
                    yield this.itemInformationService.update(itemInformationId, itemInformation);
                }
                else {
                    itemInformation = body.itemInformation;
                    itemInformation.listing_item_template_id = id;
                    yield this.itemInformationService.create(itemInformation);
                }
            }
            else if (!_.isEmpty(itemInformation)) {
                yield this.itemInformationService.destroy(itemInformation.id);
            }
            // payment-information
            let paymentInformation = updatedListingItemTemplate.related('PaymentInformation').toJSON() || {};
            if (!_.isEmpty(body.paymentInformation)) {
                if (!_.isEmpty(paymentInformation)) {
                    const paymentInformationId = paymentInformation.id;
                    paymentInformation = body.paymentInformation;
                    paymentInformation.listing_item_template_id = id;
                    yield this.paymentInformationService.update(paymentInformationId, paymentInformation);
                }
                else {
                    paymentInformation = body.paymentInformation;
                    paymentInformation.listing_item_template_id = id;
                    yield this.paymentInformationService.create(paymentInformation);
                }
            }
            else if (!_.isEmpty(paymentInformation)) {
                yield this.paymentInformationService.destroy(paymentInformation.id);
            }
            // find related record and delete it and recreate related data
            const existintMessagingInformation = updatedListingItemTemplate.related('MessagingInformation').toJSON() || [];
            const newMessagingInformation = body.messagingInformation || [];
            // delete MessagingInformation if not exist with new params
            for (const msgInfo of existintMessagingInformation) {
                if (!(yield this.checkExistingObject(newMessagingInformation, 'id', msgInfo.id))) {
                    yield this.messagingInformationService.destroy(msgInfo.id);
                }
            }
            // update or create messaging itemInformation
            for (const msgInfo of newMessagingInformation) {
                msgInfo.listing_item_template_id = id;
                const message = yield this.checkExistingObject(existintMessagingInformation, 'id', msgInfo.id);
                delete msgInfo.id;
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
            const existingListingItemObjects = updatedListingItemTemplate.related('ListingItemObjects').toJSON() || [];
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
                object.listing_item_template_id = id;
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
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplateModel = yield this.findOne(id);
            if (!listingItemTemplateModel) {
                throw new NotFoundException_1.NotFoundException('ListingItemTemplate does not exist. id = ' + id);
            }
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            this.log.debug('delete listingItemTemplate:', listingItemTemplate.id);
            if (_.isEmpty(listingItemTemplate.ListingItems)) {
                yield this.listingItemTemplateRepo.destroy(id);
            }
            else {
                throw new MessageException_1.MessageException('ListingItemTemplate has ListingItems.');
            }
        });
    }
    // check if object is exist in a array
    checkExistingObject(objectArray, fieldName, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield _.find(objectArray, (object) => {
                return (object[fieldName] === value);
            });
        });
    }
    // find highest order number from listingItemObjects
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
    tslib_1.__param(0, Validate_1.request(ListingItemTemplateSearchParams_1.ListingItemTemplateSearchParams)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplateSearchParams_1.ListingItemTemplateSearchParams]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplateService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemTemplateCreateRequest_1.ListingItemTemplateCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplateCreateRequest_1.ListingItemTemplateCreateRequest, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplateService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ListingItemTemplateUpdateRequest_1.ListingItemTemplateUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ListingItemTemplateUpdateRequest_1.ListingItemTemplateUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplateService.prototype, "update", null);
ListingItemTemplateService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ListingItemTemplateRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.PaymentInformationService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.MessagingInformationService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.CryptocurrencyAddressService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.ListingItemObjectService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(6, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplateRepository_1.ListingItemTemplateRepository,
        ItemInformationService_1.ItemInformationService,
        PaymentInformationService_1.PaymentInformationService,
        MessagingInformationService_1.MessagingInformationService,
        CryptocurrencyAddressService_1.CryptocurrencyAddressService,
        ListingItemObjectService_1.ListingItemObjectService, Object])
], ListingItemTemplateService);
exports.ListingItemTemplateService = ListingItemTemplateService;
//# sourceMappingURL=ListingItemTemplateService.js.map