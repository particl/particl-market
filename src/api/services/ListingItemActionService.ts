// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Core, Events, Targets, Types } from '../../constants';
import { request, validate } from '../../core/api/Validate';
import { ListingItem } from '../models/ListingItem';
import { MessagingInformationService } from './MessagingInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemCategoryService } from './ItemCategoryService';
import { ListingItemTemplatePostRequest } from '../requests/ListingItemTemplatePostRequest';
import { ListingItemUpdatePostRequest } from '../requests/ListingItemUpdatePostRequest';
import { ListingItemTemplateService } from './ListingItemTemplateService';
import { ListingItemFactory } from '../factories/model/ListingItemFactory';
import { SmsgService } from './SmsgService';
import { ListingItemObjectService } from './ListingItemObjectService';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ListingItemService } from './ListingItemService';
import { CoreRpcService } from './CoreRpcService';
import { ProposalService } from './ProposalService';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';
import { FlaggedItemCreateRequest } from '../requests/FlaggedItemCreateRequest';
import { FlaggedItem } from '../models/FlaggedItem';
import { FlaggedItemService } from './FlaggedItemService';
import { ListingItemAddMessageCreateParams, MarketplaceMessageFactory } from '../factories/message/MarketplaceMessageFactory';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ListingItemAddMessage } from '../messages/actions/ListingItemAddMessage';
import { ListingItemAddValidator } from '../messages/validators/ListingItemAddValidator';

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
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.FlaggedItemService) private flaggedItemService: FlaggedItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) private listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.MarketplaceMessageFactory) private marketplaceMessageFactory: MarketplaceMessageFactory,
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
     * @param estimateFee
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async post( @request(ListingItemTemplatePostRequest) data: ListingItemTemplatePostRequest, estimateFee: boolean = false): Promise<SmsgSendResponse> {

        // fetch the listingItemTemplate
        const itemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.listingItemTemplateId, true)
            .then(value => value.toJSON());

        // TODO: should validate that the template has the required info
        // TODO: recalculate the template.hash in case the related data has changed

        // this.log.debug('post template: ', JSON.stringify(itemTemplate, null, 2));
        // get the templates profile address
        const profileAddress = itemTemplate.Profile.address;

        const marketModel = data.marketId
            ? await this.marketService.findOne(data.marketId)
            : await this.marketService.getDefault();

        const market: resources.Market = marketModel.toJSON();
        this.log.debug('market.id:', market.id);

        // todo: reason for this? to throw an exception unless category exists?!
        // find itemCategory with related
        const itemCategory: resources.ItemCategory = await this.itemCategoryService.findOneByKey(itemTemplate.ItemInformation.ItemCategory.key, true)
            .then(value => value.toJSON());
        // this.log.debug('itemCategory: ', JSON.stringify(itemCategory, null, 2));

        // create the MPA_LISTING_ADD
        const marketplaceMessage: MarketplaceMessage = await this.marketplaceMessageFactory.get(MPAction.MPA_LISTING_ADD, {
            template: itemTemplate
        } as ListingItemMessageCreateParams);

        // validate the MPA_LISTING_ADD
        ListingItemAddValidator.validate(marketplaceMessage);

        // post the MPA_LISTING_ADD
        return await this.smsgService.smsgSend(profileAddress, market.address, marketplaceMessage, true, data.daysRetention, estimateFee);
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
        const listingItemAddMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

        // validate the MPA_LISTING_ADD
        ListingItemAddValidator.validate(marketplaceMessage);

        // process the message and return SmsgMessageStatus as a result
        return await this.marketService.findByAddress(smsgMessage.to)
            .then(async marketModel => {
                const market: resources.Market = marketModel.toJSON();

                // create the new custom categories in case there are some
                await this.itemCategoryService.createCategoriesFromArray(listingItemAddMessage.item.information.category);

                // find the categories/get the root category with related
                const rootCategory: resources.ItemCategory = await this.itemCategoryService.findRoot()
                    .then(value => value.toJSON());

                const listingItemCreateRequest = await this.listingItemFactory.get(listingItemAddMessage, smsgMessage, market.id, rootCategory);
                // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

                let listingItem: resources.ListingItem = await this.listingItemService.create(listingItemCreateRequest)
                    .then(value => value.toJSON());

                // if proposal for the listingitem is found, create flaggeditem
                await this.proposalService.findOneByItemHash(listingItem.hash)
                    .then(async value => {
                        const proposal: resources.Proposal = value.toJSON();
                        const flaggedItem = await this.createFlaggedItemForProposal(proposal);
                        // this.log.debug('flaggedItem:', JSON.stringify(flaggedItem, null, 2));
                        return proposal;
                    })
                    .catch(reason => {
                        return null;
                    });

                // todo: there should be no need for these two updates, set the relations up in the createRequest
                // update the template relation
                await this.listingItemService.updateListingItemTemplateRelation(listingItem.id);

                // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
                listingItem = await this.listingItemService.findOne(listingItem.id)
                    .then(value => value.toJSON());

                this.log.debug('==> PROCESSED LISTINGITEM: ', listingItem.hash);
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                return SmsgMessageStatus.PARSING_FAILED;
            });

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
