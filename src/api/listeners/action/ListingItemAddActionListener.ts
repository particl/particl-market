// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ListingItemCreateParams } from '../../factories/model/ModelCreateParams';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { MarketService } from '../../services/model/MarketService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { FlaggedItemService } from '../../services/model/FlaggedItemService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { ProposalService } from '../../services/model/ProposalService';
import { ActionListenerInterface } from '../ActionListenerInterface';
import { BaseActionListenr } from '../BaseActionListenr';
import { BidService } from '../../services/model/BidService';
import { ProfileService } from '../../services/model/ProfileService';

export class ListingItemAddActionListener extends BaseActionListenr implements interfaces.Listener, ActionListenerInterface {

    public static Event = Symbol(MPAction.MPA_LISTING_ADD);

    constructor(
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_LISTING_ADD, smsgMessageService, bidService, proposalService, Logger);
    }

    /**
     * handles the received ListingItemAddMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        this.log.debug('ListingItemAddActionListener.onEvent()');
        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

        // - if ListingItem contains a custom category, create them
        // - fetch the root category with related to create the listingItemCreateRequest
        // - create the ListingItem locally with the listingItemCreateRequest
        // - if there's a Proposal to remove the ListingItem, create a FlaggedItem related to the ListingItem
        // - if there's a matching ListingItemTemplate, create a relation


        // todo: custom categories not supported and needs to be refactored
        const category: resources.ItemCategory = await this.itemCategoryService.createCategoriesFromArray(actionMessage.item.information.category);
        const rootCategory: resources.ItemCategory = await this.itemCategoryService.findRoot().then(value => value.toJSON());

        const listingItemCreateRequest = await this.listingItemFactory.get({
                msgid: smsgMessage.msgid,
                market: smsgMessage.to,
                rootCategory
            } as ListingItemCreateParams,
            actionMessage,
            smsgMessage);

        return await this.listingItemService.create(listingItemCreateRequest)
            .then(async value => {
                const listingItem: resources.ListingItem = value.toJSON();

                await this.createFlaggedItemIfNeeded(listingItem);
                await this.updateListingItemAndTemplateRelationIfNeeded(listingItem);

                this.log.debug('PROCESSED: ' + smsgMessage.msgid + ' / ' + listingItem.id + ' / ' + listingItem.hash);
                return SmsgMessageStatus.PROCESSED;

            })
            .catch(reason => {
                this.log.error('PROCESSING FAILED: ', smsgMessage.msgid);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }

    /**
     * If a ListingItemTemplate matching with ListingItem is found, add a relation
     *
     * @param listingItem
     */
    public async updateListingItemAndTemplateRelationIfNeeded(listingItem: resources.ListingItem): Promise<void> {
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOneByHash(listingItem.hash)
            .then(value => value.toJSON())
            .catch(reason => {
                return undefined;
            });
        if (listingItemTemplate) {
            await this.listingItemService.updateListingItemAndTemplateRelation(listingItem, listingItemTemplate);
        }
        return;
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
