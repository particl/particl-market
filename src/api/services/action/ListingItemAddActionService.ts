// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItem } from '../../models/ListingItem';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { SmsgService } from '../SmsgService';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { MarketService } from '../model/MarketService';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ListingItemCreateParams} from '../../factories/model/ModelCreateParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { ListingItemAddValidator } from '../../messages/validator/ListingItemAddValidator';
import { ompVersion } from 'omp-lib/dist/omp';
import { ListingItemAddMessageFactory } from '../../factories/message/ListingItemAddMessageFactory';
import { ListingItemAddMessageCreateParams } from '../../requests/message/ListingItemAddMessageCreateParams';

export class ListingItemAddActionService extends BaseActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemAddMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_LISTING_ADD, smsgService, smsgMessageService, smsgMessageFactory, eventEmitter);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param params
     */
    public async createMessage(params: ListingItemAddRequest): Promise<MarketplaceMessage> {
        const actionMessage: ListingItemAddMessage = await this.listingItemAddMessageFactory.get({
            listingItem: params.listingItem // in this case this is actually the listingItemTemplate, as we use to create the message from both
        } as ListingItemAddMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return ListingItemAddValidator.isValid(marketplaceMessage);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     */
    public async beforePost(params: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

    /**
     * handles the received ListingItemAddMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

        // - first get the Market, fail if it doesn't exist
        // - if ListingItem contains a custom category, create them
        // - fetch the root category with related to create the listingItemCreateRequest
        // - create the ListingItem locally with the listingItemCreateRequest
        // - if there's a Proposal to remove the ListingItem, create a FlaggedItem related to the ListingItem
        // - if there's a matching ListingItemTemplate, create a relation

        return await this.marketService.findByAddress(smsgMessage.to)
            .then(async marketModel => {
                const market: resources.Market = marketModel.toJSON();

                await this.itemCategoryService.createCategoriesFromArray(actionMessage.item.information.category);
                const rootCategory: resources.ItemCategory = await this.itemCategoryService.findRoot().then(value => value.toJSON());
                const listingItemCreateRequest = await this.listingItemFactory.get({
                        msgid: smsgMessage.msgid,
                        marketId: market.id,
                        rootCategory
                    } as ListingItemCreateParams,
                    actionMessage,
                    smsgMessage);

                return await this.listingItemService.create(listingItemCreateRequest)
                    .then(async value => {
                        const listingItem: resources.ListingItem = value.toJSON();
                        await this.createFlaggedItemIfNeeded(listingItem);
                        await this.updateListingItemAndTemplateRelationIfNeeded(listingItem);
                        return SmsgMessageStatus.PROCESSED;
                    })
                    .catch(reason => {
                        return SmsgMessageStatus.PROCESSING_FAILED;
                    });
            })
            .catch(reason => {
                // market not found
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }

    /**
     * If a ListingItemTemplate matching with ListingItem is found, add a relation
     *
     * @param listingItem
     */
    public async updateListingItemAndTemplateRelationIfNeeded(listingItem: resources.ListingItem): Promise<ListingItem> {
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOneByHash(listingItem.hash)
            .then(value => value.toJSON())
            .catch(reason => {
                return undefined;
            });
        return await this.listingItemService.updateListingItemAndTemplateRelation(listingItem, listingItemTemplate);
    }

    /**
     * If a Proposal to remove the ListingItem is found, create FlaggedItem
     *
     * @param listingItem
     */
    private async createFlaggedItemIfNeeded(listingItem: resources.ListingItem): Promise<resources.FlaggedItem | void> {
        await this.proposalService.findOneByItemHash(listingItem.hash)
            .then(async value => {
                const proposal: resources.Proposal = value.toJSON();
                return await this.createFlaggedItemForListingItem(listingItem, proposal);
            })
            .catch(reason => {
                return null;
            });
    }


    /**
     * Create FlaggedItem for ListingItem having a Proposal to remove it
     *
     * @param listingItem
     * @param {module:resources.Proposal} proposal
     * @returns {Promise<module:resources.FlaggedItem>}
     */
    private async createFlaggedItemForListingItem(listingItem: resources.ListingItem,
                                                  proposal: resources.Proposal): Promise<resources.FlaggedItem> {
        const flaggedItemCreateRequest = {
            listing_item_id: listingItem.id,
            proposal_id: proposal.id,
            reason: proposal.description
        } as FlaggedItemCreateRequest;

        return await this.flaggedItemService.create(flaggedItemCreateRequest).then(value => value.toJSON());
    }

}
