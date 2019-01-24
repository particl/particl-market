// Copyright (c) 2017-2019, The Particl Market developers
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
import { CoreRpcService } from './CoreRpcService';
import { ProposalService } from './ProposalService';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';
import { FlaggedItemCreateRequest } from '../requests/FlaggedItemCreateRequest';
import { FlaggedItem } from '../models/FlaggedItem';
import { FlaggedItemService } from './FlaggedItemService';

export class ListingItemActionService {

    public log: LoggerType;

    constructor(
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
        @inject(Types.Service) @named(Targets.Service.FlaggedItemService) private flaggedItemService: FlaggedItemService,
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) private listingItemFactory: ListingItemFactory,
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
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async post( @request(ListingItemTemplatePostRequest) data: ListingItemTemplatePostRequest): Promise<SmsgSendResponse> {

        // fetch the listingItemTemplate
        const itemTemplateModel = await this.listingItemTemplateService.findOne(data.listingItemTemplateId, true);
        let itemTemplate = itemTemplateModel.toJSON();

        // TODO: should validate that the template has the required info
        // TODO: recalculate the template.hash in case the related data has changed

        const listingMessageSizeData = await this.listingItemTemplateService.calculateMarketplaceMessageSize(itemTemplate);
        if (!listingMessageSizeData.fits) {
            itemTemplate = await this.listingItemTemplateService.createResizedTemplateImages(itemTemplate);
            this.log.debug('images resized');
        }

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

            const proposal = await this.proposalService.findOneByItemHash(listingItem.hash)
                .then(async proposalModel => {
                    return proposalModel.toJSON();
                })
                .catch(reason => {
                    return null;
                });

            if (proposal) {
                // if proposal for the listingitem is found, create flaggeditem
                const flaggedItem = await this.createFlaggedItemForProposal(proposal);
                // this.log.debug('flaggedItem:', JSON.stringify(flaggedItem, null, 2));
            }

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
     * @param {module:resources.Proposal} proposal
     * @returns {Promise<module:resources.FlaggedItem>}
     */
    public async createFlaggedItemForProposal(proposal: resources.Proposal): Promise<resources.FlaggedItem> {
        // if listingitem exists && theres no relation -> add relation to listingitem

        const listingItemModel = await this.listingItemService.findOneByHash(proposal.title);
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        const flaggedItemCreateRequest = {
            listing_item_id: listingItem.id,
            proposal_id: proposal.id,
            reason: proposal.description
        } as FlaggedItemCreateRequest;

        const flaggedItemModel: FlaggedItem = await this.flaggedItemService.create(flaggedItemCreateRequest);
        return flaggedItemModel.toJSON();
    }

    /**
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    /*private async shouldAddListingItem(proposalResult: resources.ProposalResult): Promise<boolean> {
        const okOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 0;
        });
        const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 1; // 1 === REMOVE
        });

        // Requirements to remove the ListingItem from the testnet marketplace, these should also be configurable:
        // at minimum, a total of 10 votes
        // at minimum, 30% of votes saying remove

        // TODO: This needs to call the same code we use for removigng votes!!!!!!
        if (removeOptionResult && okOptionResult && removeOptionResult.weight > 10
            && (removeOptionResult.weight / (removeOptionResult.weight + okOptionResult.weight) > 0.3)) {
            return false;
        } else {
            return true;
        }
    }*/

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners');

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
