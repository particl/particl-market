"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const MessagingInformationService_1 = require("./MessagingInformationService");
const PaymentInformationService_1 = require("./PaymentInformationService");
const ItemInformationService_1 = require("./ItemInformationService");
const ItemCategoryService_1 = require("./ItemCategoryService");
const ListingItemTemplatePostRequest_1 = require("../requests/ListingItemTemplatePostRequest");
const ListingItemUpdatePostRequest_1 = require("../requests/ListingItemUpdatePostRequest");
const ListingItemTemplateService_1 = require("./ListingItemTemplateService");
const ListingItemFactory_1 = require("../factories/ListingItemFactory");
const SmsgService_1 = require("./SmsgService");
const ListingItemObjectService_1 = require("./ListingItemObjectService");
const NotImplementedException_1 = require("../exceptions/NotImplementedException");
const events_1 = require("events");
const MessageException_1 = require("../exceptions/MessageException");
const ListingItemService_1 = require("./ListingItemService");
const ActionMessageService_1 = require("./ActionMessageService");
const ImageProcessing_1 = require("../../core/helpers/ImageProcessing");
const CoreRpcService_1 = require("./CoreRpcService");
const ProposalService_1 = require("./ProposalService");
const ProfileService_1 = require("./ProfileService");
const MarketService_1 = require("./MarketService");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
const SmsgMessageService_1 = require("./SmsgMessageService");
const FlaggedItemService_1 = require("./FlaggedItemService");
const ImageVersionEnumType_1 = require("../../core/helpers/ImageVersionEnumType");
let ListingItemActionService = class ListingItemActionService {
    constructor(itemInformationService, itemCategoryService, paymentInformationService, messagingInformationService, listingItemTemplateService, listingItemService, listingItemObjectService, smsgService, actionMessageService, smsgMessageService, coreRpcService, proposalService, profileService, marketService, flaggedItemService, listingItemFactory, eventEmitter, Logger) {
        this.itemInformationService = itemInformationService;
        this.itemCategoryService = itemCategoryService;
        this.paymentInformationService = paymentInformationService;
        this.messagingInformationService = messagingInformationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.listingItemService = listingItemService;
        this.listingItemObjectService = listingItemObjectService;
        this.smsgService = smsgService;
        this.actionMessageService = actionMessageService;
        this.smsgMessageService = smsgMessageService;
        this.coreRpcService = coreRpcService;
        this.proposalService = proposalService;
        this.profileService = profileService;
        this.marketService = marketService;
        this.flaggedItemService = flaggedItemService;
        this.listingItemFactory = listingItemFactory;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }
    /**
     * post a ListingItem based on a given ListingItem as ListingItemMessage
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    post(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // fetch the listingItemTemplate
            const itemTemplateModel = yield this.listingItemTemplateService.findOne(data.listingItemTemplateId, true);
            let itemTemplate = itemTemplateModel.toJSON();
            // TODO: should validate that the template has the required info
            // TODO: recalculate the template.hash in case the related data has changed
            itemTemplate = yield this.resizeTemplateImages(itemTemplate);
            this.log.debug('images resized');
            // this.log.debug('post template: ', JSON.stringify(itemTemplate, null, 2));
            // get the templates profile address
            const profileAddress = itemTemplate.Profile.address;
            let marketModel;
            if (!data.marketId) {
                // fetch the market, will be used later with the broadcast
                marketModel = yield this.marketService.getDefault();
            }
            else {
                marketModel = yield this.marketService.findOne(data.marketId);
            }
            const market = marketModel.toJSON();
            this.log.debug('market:', market.id);
            // todo: reason for this? to throw an exception unless category exists?!
            // find itemCategory with related
            const itemCategoryModel = yield this.itemCategoryService.findOneByKey(itemTemplate.ItemInformation.ItemCategory.key, true);
            const itemCategory = itemCategoryModel.toJSON();
            // this.log.debug('itemCategory: ', JSON.stringify(itemCategory, null, 2));
            // create and post the itemmessage
            const listingItemMessage = yield this.listingItemFactory.getMessage(itemTemplate);
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                item: listingItemMessage
            };
            return yield this.smsgService.smsgSend(profileAddress, market.address, marketPlaceMessage, true, data.daysRetention);
        });
    }
    /**
     * update a ListingItem based on a given ListingItem as ListingItemUpdateMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    updatePostItem(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: update not implemented/supported yet
            throw new NotImplementedException_1.NotImplementedException();
        });
    }
    /**
     * processes received ListingItemMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ListingItem>}
     */
    processListingItemReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const smsgMessage = event.smsgMessage;
            const marketplaceMessage = event.marketplaceMessage;
            const listingItemMessage = marketplaceMessage.item;
            if (marketplaceMessage.market && marketplaceMessage.item) {
                // get market
                const marketModel = yield this.marketService.findByAddress(marketplaceMessage.market);
                const market = marketModel.toJSON();
                // create the new custom categories in case there are some
                const itemCategory = yield this.itemCategoryService.createCategoriesFromArray(listingItemMessage.information.category);
                // find the categories/get the root category with related
                const rootCategoryWithRelatedModel = yield this.itemCategoryService.findRoot();
                const rootCategory = rootCategoryWithRelatedModel.toJSON();
                const listingItemCreateRequest = yield this.listingItemFactory.getModel(listingItemMessage, smsgMessage, market.id, rootCategory);
                // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));
                let listingItemModel = yield this.listingItemService.create(listingItemCreateRequest);
                let listingItem = listingItemModel.toJSON();
                const proposal = yield this.proposalService.findOneByItemHash(listingItem.hash)
                    .then((proposalModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return proposalModel.toJSON();
                }))
                    .catch(reason => {
                    return null;
                });
                if (proposal) {
                    // if proposal for the listingitem is found, create flaggeditem
                    const flaggedItem = yield this.createFlaggedItemForProposal(proposal);
                    // this.log.debug('flaggedItem:', JSON.stringify(flaggedItem, null, 2));
                }
                // todo: there should be no need for these two updates, set the relations up in the createRequest
                // update the template relation
                yield this.listingItemService.updateListingItemTemplateRelation(listingItem.id);
                // todo: we could propably get rid of these actionmessages
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // this.log.debug('created actionMessage:', JSON.stringify(actionMessage, null, 2));
                // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
                listingItemModel = yield this.listingItemService.findOne(listingItem.id);
                listingItem = listingItemModel.toJSON();
                this.log.debug('==> PROCESSED LISTINGITEM: ', listingItem.hash);
                return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
            }
            else {
                throw new MessageException_1.MessageException('Marketplace message missing market.');
            }
        });
    }
    /**
     *
     * @param {module:resources.Proposal} proposal
     * @returns {Promise<module:resources.FlaggedItem>}
     */
    createFlaggedItemForProposal(proposal) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // if listingitem exists && theres no relation -> add relation to listingitem
            const listingItemModel = yield this.listingItemService.findOneByHash(proposal.title);
            const listingItem = listingItemModel.toJSON();
            const flaggedItemCreateRequest = {
                listing_item_id: listingItem.id,
                proposal_id: proposal.id,
                reason: proposal.description
            };
            const flaggedItemModel = yield this.flaggedItemService.create(flaggedItemCreateRequest);
            return flaggedItemModel.toJSON();
        });
    }
    /**
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    shouldAddListingItem(proposalResult) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const okOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult) => {
                return proposalOptionResult.ProposalOption.optionId === 0;
            });
            const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult) => {
                return proposalOptionResult.ProposalOption.optionId === 1; // 1 === REMOVE
            });
            // Requirements to remove the ListingItem from the testnet marketplace, these should also be configurable:
            // at minimum, a total of 10 votes
            // at minimum, 30% of votes saying remove
            if (removeOptionResult && okOptionResult && removeOptionResult.weight > 10
                && (removeOptionResult.weight / (removeOptionResult.weight + okOptionResult.weight) > 0.3)) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    /**
     *
     * @param {"resources".ListingItemTemplate} itemTemplate
     * @returns {Promise<"resources".ListingItemTemplate>}
     */
    resizeTemplateImages(itemTemplate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImages = itemTemplate.ItemInformation.ItemImages;
            // ItemInformation has ItemImages, which is an array.
            // Each element in ItemImages has an array ItemImageDatas.
            const sizePerImage = (ListingItemActionService.MAX_SMSG_SIZE - ListingItemActionService.OVERHEAD_PER_SMSG)
                / itemImages.length - ListingItemActionService.OVERHEAD_PER_IMAGE;
            for (const tmpIndexOfImages in itemImages) {
                if (tmpIndexOfImages) {
                    let resizedImage;
                    let indexOfData;
                    {
                        let foundOriginal = false;
                        const itemImage = itemImages[tmpIndexOfImages];
                        for (const tmpIndexOfData in itemImage.ItemImageDatas) {
                            if (tmpIndexOfData
                                && itemImage.ItemImageDatas[tmpIndexOfData].imageVersion === ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName) {
                                resizedImage = itemImage.ItemImageDatas[tmpIndexOfData].ItemImageDataContent.data;
                                foundOriginal = true;
                                indexOfData = tmpIndexOfData;
                                // this.log.error('Found original. Continuing...');
                                break;
                            }
                        }
                        if (!foundOriginal) {
                            // this.log.error('Couldn\'t find original. Skipping...');
                            continue;
                        }
                    }
                    let compressedImage = resizedImage;
                    for (let numResizings = 0;;) {
                        if (compressedImage.length <= sizePerImage) {
                            break;
                        }
                        const compressedImage2 = yield ImageProcessing_1.ImageProcessing.downgradeQuality(compressedImage, ListingItemActionService.FRACTION_TO_COMPRESS_BY);
                        if (compressedImage.length !== compressedImage2.length) {
                            /* We have not yet reached the limit of compression. */
                            compressedImage = compressedImage2;
                            continue;
                        }
                        else {
                            ++numResizings;
                            if (numResizings >= ListingItemActionService.MAX_RESIZES) {
                                /* A generous number of resizes has happened but we haven't found a solution yet. Exit incase this is an infinite loop. */
                                throw new MessageException_1.MessageException('After ${numResizings} resizes we still didn\'t compress the image enough.'
                                    + ' Image size = ${compressedImage.length}.');
                            }
                            /* we've reached the limit of compression. We need to resize the image for further size losses. */
                            resizedImage = yield ImageProcessing_1.ImageProcessing.resizeImageToFraction(resizedImage, ListingItemActionService.FRACTION_TO_RESIZE_IMAGE_BY);
                            compressedImage = resizedImage;
                            break;
                        }
                    }
                    itemTemplate.ItemInformation.ItemImages[tmpIndexOfImages].ItemImageDatas[indexOfData].ItemImageDataContent.data = compressedImage;
                }
            }
            return itemTemplate;
        });
    }
    configureEventListeners() {
        this.log.info('Configuring EventListeners ');
        this.eventEmitter.on(constants_1.Events.ListingItemReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event, message type: ' + event.smsgMessage.type + ', msgid: ' + event.smsgMessage.msgid);
            yield this.processListingItemReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.debug('ERRORED event: ', JSON.stringify(event, null, 2));
                this.log.error('ERROR: ListingItemMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
    }
};
ListingItemActionService.FRACTION_TO_COMPRESS_BY = 0.6;
ListingItemActionService.FRACTION_TO_RESIZE_IMAGE_BY = 0.6;
ListingItemActionService.MAX_SMSG_SIZE = 400000; // TODO: Give these more accurate values
ListingItemActionService.OVERHEAD_PER_SMSG = 0;
ListingItemActionService.OVERHEAD_PER_IMAGE = 0;
ListingItemActionService.MAX_RESIZES = 20;
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemTemplatePostRequest_1.ListingItemTemplatePostRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplatePostRequest_1.ListingItemTemplatePostRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemActionService.prototype, "post", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemUpdatePostRequest_1.ListingItemUpdatePostRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemUpdatePostRequest_1.ListingItemUpdatePostRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemActionService.prototype, "updatePostItem", null);
ListingItemActionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.PaymentInformationService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.MessagingInformationService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ListingItemObjectService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.ActionMessageService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(12, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(13, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(14, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(14, inversify_1.named(constants_1.Targets.Service.FlaggedItemService)),
    tslib_1.__param(15, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(15, inversify_1.named(constants_1.Targets.Factory.ListingItemFactory)),
    tslib_1.__param(16, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(16, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(17, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(17, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemInformationService_1.ItemInformationService,
        ItemCategoryService_1.ItemCategoryService,
        PaymentInformationService_1.PaymentInformationService,
        MessagingInformationService_1.MessagingInformationService,
        ListingItemTemplateService_1.ListingItemTemplateService,
        ListingItemService_1.ListingItemService,
        ListingItemObjectService_1.ListingItemObjectService,
        SmsgService_1.SmsgService,
        ActionMessageService_1.ActionMessageService,
        SmsgMessageService_1.SmsgMessageService,
        CoreRpcService_1.CoreRpcService,
        ProposalService_1.ProposalService,
        ProfileService_1.ProfileService,
        MarketService_1.MarketService,
        FlaggedItemService_1.FlaggedItemService,
        ListingItemFactory_1.ListingItemFactory,
        events_1.EventEmitter, Object])
], ListingItemActionService);
exports.ListingItemActionService = ListingItemActionService;
//# sourceMappingURL=ListingItemActionService.js.map