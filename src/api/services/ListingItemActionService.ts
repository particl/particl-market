// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { ListingItem } from '../models/ListingItem';

import { MessagingInformationService } from './MessagingInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemInformationService } from './ItemInformationService';
import { ItemCategoryService } from './ItemCategoryService';

import { ListingItemTemplatePostRequest } from '../requests/ListingItemTemplatePostRequest';
import { ListingItemUpdatePostRequest } from '../requests/ListingItemUpdatePostRequest';

import { ListingItemTemplateService } from './ListingItemTemplateService';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { SmsgService } from './SmsgService';
import { ListingItemObjectService } from './ListingItemObjectService';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import * as resources from 'resources';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MessageException } from '../exceptions/MessageException';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ListingItemService } from './ListingItemService';
import { ActionMessageService } from './ActionMessageService';

import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { ProposalFactory } from '../factories/ProposalFactory';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { ProposalType } from '../enums/ProposalType';
import { CoreRpcService } from './CoreRpcService';
import { ProposalMessage } from '../messages/ProposalMessage';
import { ProposalService } from './ProposalService';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ProfileService } from './ProfileService';
import { VoteMessageType } from '../enums/VoteMessageType';
import { VoteFactory } from '../factories/VoteFactory';
import { MarketService } from './MarketService';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';

export class ListingItemActionService {
    private static FRACTION_TO_COMPRESS_BY = 0.6;
    private static FRACTION_TO_RESIZE_IMAGE_BY = 0.6;
    private static MAX_SMSG_SIZE = 400000; // TODO: Give these more accurate values
    private static OVERHEAD_PER_SMSG = 0;
    private static OVERHEAD_PER_IMAGE = 0;
    private static MAX_RESIZES = 20;

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) private listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * post a ListingItem based on a given ListingItem as ListingItemMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async post( @request(ListingItemTemplatePostRequest) data: ListingItemTemplatePostRequest): Promise<SmsgSendResponse> {

        // fetch the listingItemTemplate
        const itemTemplateModel = await this.listingItemTemplateService.findOne(data.listingItemTemplateId, true);
        let itemTemplate = itemTemplateModel.toJSON();

        // TODO: should validate that the template has the required info
        // TODO: recalculate the template.hash in case the related data has changed

        itemTemplate = await this.resizeTemplateImages(itemTemplate);
        this.log.debug('images resized');

        // this.log.debug('post template: ', JSON.stringify(itemTemplate, null, 2));
        // get the templates profile address
        const profileAddress = itemTemplate.Profile.address;

        let marketModel;
        if (!data.marketId) {
            // fetch the market, will be used later with the broadcast
            marketModel = await this.marketService.getDefault();
        } else {
            marketModel = await this.marketService.findOne(data.marketId);
        }
        const market: resources.Market = marketModel.toJSON();
        this.log.debug('market:', market.id);

        // todo: reason for this? to throw an exception unless category exists?!
        // find itemCategory with related
        const itemCategoryModel = await this.itemCategoryService.findOneByKey(itemTemplate.ItemInformation.ItemCategory.key, true);
        const itemCategory = itemCategoryModel.toJSON();
        // this.log.debug('itemCategory: ', JSON.stringify(itemCategory, null, 2));

        // create and post the itemmessage
        const listingItemMessage = await this.listingItemFactory.getMessage(itemTemplate);
        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage
        } as MarketplaceMessage;

        return await this.smsgService.smsgSend(profileAddress, market.address, marketPlaceMessage, true, data.daysRetention);
    }

    /**
     * update a ListingItem based on a given ListingItem as ListingItemUpdateMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async updatePostItem( @request(ListingItemUpdatePostRequest) data: ListingItemUpdatePostRequest): Promise<void> {

        // TODO: update not implemented/supported yet
        throw new NotImplementedException();
    }

    /**
     * processes received ListingItemMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ListingItem>}
     */
    public async processListingItemReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const listingItemMessage: ListingItemMessage = marketplaceMessage.item as ListingItemMessage;

        if (marketplaceMessage.market && marketplaceMessage.item) {

            // get market
            const marketModel = await this.marketService.findByAddress(marketplaceMessage.market);
            const market = marketModel.toJSON();

            // create the new custom categories in case there are some
            const itemCategory: resources.ItemCategory = await this.itemCategoryService.createCategoriesFromArray(listingItemMessage.information.category);

            // find the categories/get the root category with related
            const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
            const rootCategory = rootCategoryWithRelatedModel.toJSON();

            const listingItemCreateRequest = await this.listingItemFactory.getModel(listingItemMessage, smsgMessage, market.id, rootCategory);
            // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

            let listingItemModel = await this.listingItemService.create(listingItemCreateRequest);
            let listingItem = listingItemModel.toJSON();

            // TODO: Proposals related to ListingItems should wait for processing until ListingItem is received
            // as we no longer have proposalHash in the ListingItemMessage

            // if proposal for the listingitem exists:
            // - update relation and vote
            await this.proposalService.findOneByItemHash(listingItem.hash || '')
                .then(async proposalModel => {
                    const proposal: resources.Proposal = proposalModel.toJSON();

                    // update the proposal relation
                    if (proposal.hash) {
                        await this.listingItemService.updateProposalRelation(listingItem.id, proposal.hash);
                    }

                    // TODO: skipping this too since the wallet could be locked
                    // await this.voteForListingItemProposal(proposal, market);
                })
                .catch(reason => {
                    // there is no proposal yet
                    this.log.warn('received ListingItem, but theres no Proposal for it yet...', listingItem.hash);
                    return null;
                });

            // if (await this.shouldAddListingItem(proposal.ProposalResult)) {
            // } else {
            //    throw new MessageException('ListingItem is allready voted off the market.');
            // }

            // todo: there should be no need for these two updates, set the relations up in the createRequest
            // update the template relation
            await this.listingItemService.updateListingItemTemplateRelation(listingItem.id);

            // todo: we could propably get rid of these actionmessages
            const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
            const actionMessage = actionMessageModel.toJSON();
            // this.log.debug('created actionMessage:', JSON.stringify(actionMessage, null, 2));

            // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
            listingItemModel = await this.listingItemService.findOne(listingItem.id);
            listingItem = listingItemModel.toJSON();

            this.log.debug('==> PROCESSED LISTINGITEM: ', listingItem.hash);
            return SmsgMessageStatus.PROCESSED;

        } else {
            throw new MessageException('Marketplace message missing market.');
        }
    }

    /**
     *
     * @param {"resources".ListingItemTemplate} itemTemplate
     * @param {number} daysRetention
     * @param {"resources".Profile} profile
     * @returns {Promise<ProposalMessage>}
     */
    public async createProposalMessage(itemTemplateHash: string, daysRetention: number,
                                       profile: resources.Profile): Promise<ProposalMessage> {

        const blockStart: number = await this.coreRpcService.getBlockCount();
        const blockEnd: number = blockStart + (daysRetention * 24 * 30);

        const proposalMessage: ProposalMessage = await this.proposalFactory.getMessage(ProposalMessageType.MP_PROPOSAL_ADD, ProposalType.ITEM_VOTE,
            itemTemplateHash, '', blockStart, blockEnd, ['OK', 'REMOVE'], profile, itemTemplateHash);

        return proposalMessage;

    }

    /**
     *
     * @param {ProposalMessage} proposalMessage
     * @param {number} daysRetention
     * @param {"resources".Profile} profile
     * @param {"resources".Market} market
     * @returns {Promise<SmsgSendResponse>}
     */
    public async postProposal(proposalMessage: ProposalMessage, daysRetention: number, profile: resources.Profile,
                              market: resources.Market): Promise<SmsgSendResponse> {

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: proposalMessage
        };

        const response = this.smsgService.smsgSend(profile.address, market.address, msg, false, daysRetention);
        this.log.debug('postProposal(), response: ', response);
        return response;

    }

    /**
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    /*private async voteForListingItemProposal(proposal: resources.Proposal, market: resources.Market): Promise<boolean> {

        // todo: remove this later
        const profileModel = await this.profileService.getDefault();
        const profile: resources.Profile = profileModel.toJSON();

        const proposalOption = _.find(proposal.ProposalOptions, (option: resources.ProposalOption) => {
            return option.optionId === 1;
        });

        if (proposalOption) {
            const currentBlock: number = await this.coreRpcService.getBlockCount();
            const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal, proposalOption,
                profile, currentBlock);

            const msg: MarketplaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: voteMessage
            };

            const smsgSendResponse: SmsgSendResponse = await this.smsgService.smsgSend(profile.address, market.address, msg, false);
            return smsgSendResponse.error === undefined ? false : true;
        } else {
            throw new MessageException('Could not find ProposalOption to vote for.');
        }
    }*/

    /**
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    private async shouldAddListingItem(proposalResult: resources.ProposalResult): Promise<boolean> {
        const okOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 0;
        });
        const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 1; // 1 === REMOVE
        });

        // Requirements to remove the ListingItem from the testnet marketplace, these should also be configurable:
        // at minimum, a total of 10 votes
        // at minimum, 30% of votes saying remove

        if (removeOptionResult && okOptionResult && removeOptionResult.weight > 10
            && (removeOptionResult.weight / (removeOptionResult.weight + okOptionResult.weight) > 0.3)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     *
     * @param {"resources".ListingItemTemplate} itemTemplate
     * @returns {Promise<"resources".ListingItemTemplate>}
     */
    private async resizeTemplateImages(itemTemplate: resources.ListingItemTemplate): Promise<resources.ListingItemTemplate> {

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
                        if (tmpIndexOfData) {
                            if (itemImage.ItemImageDatas[tmpIndexOfData].imageVersion === 'ORIGINAL') {
                                resizedImage = itemImage.ItemImageDatas[tmpIndexOfData].ItemImageDataContent.data;
                                foundOriginal = true;
                                indexOfData = tmpIndexOfData;
                                // this.log.error('Found original. Continuing...');
                                break;
                            }
                        }
                    }
                    if (!foundOriginal) {
                        // this.log.error('Couldn\'t find original. Skipping...');
                        continue;
                    }
                }
                let compressedImage = resizedImage;
                for (let numResizings = 0; ;) {
                    if (compressedImage.length <= sizePerImage) {
                        break;
                    }
                    const compressedImage2 = await ImageProcessing.downgradeQuality(compressedImage, ListingItemActionService.FRACTION_TO_COMPRESS_BY);
                    if (compressedImage.length !== compressedImage2.length) {
                        /* We have not yet reached the limit of compression. */
                        compressedImage = compressedImage2;
                        continue;
                    } else {
                        ++numResizings;
                        if (numResizings >= ListingItemActionService.MAX_RESIZES) {
                            /* A generous number of resizes has happened but we haven't found a solution yet. Exit incase this is an infinite loop. */
                            throw new MessageException('After ${numResizings} resizes we still didn\'t compress the image enough.'
                                + ' Image size = ${compressedImage.length}.');
                        }
                        /* we've reached the limit of compression. We need to resize the image for further size losses. */
                        resizedImage = await ImageProcessing.resizeImageToFraction(resizedImage, ListingItemActionService.FRACTION_TO_RESIZE_IMAGE_BY);
                        compressedImage = resizedImage;
                        break;
                    }
                }
                itemTemplate.ItemInformation.ItemImages[tmpIndexOfImages].ItemImageDatas[indexOfData].ItemImageDataContent.data = compressedImage;
            }
        }

        return itemTemplate;
    }

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners ');

        this.eventEmitter.on(Events.ListingItemReceivedEvent, async (event) => {
            this.log.debug('Received event, message type: ' + event.smsgMessage.type + ', msgid: ' + event.smsgMessage.msgid);
            await this.processListingItemReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.debug('ERRORED event: ', JSON.stringify(event, null, 2));
                    this.log.error('ERROR: ListingItemMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });

    }

}
