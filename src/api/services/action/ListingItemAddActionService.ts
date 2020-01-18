// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { SmsgService } from '../SmsgService';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddValidator } from '../../messagevalidators/ListingItemAddValidator';
import { ompVersion } from 'omp-lib/dist/omp';
import { ListingItemAddMessageFactory } from '../../factories/message/ListingItemAddMessageFactory';
import { ListingItemAddMessageCreateParams } from '../../requests/message/ListingItemAddMessageCreateParams';
import { CoreRpcService } from '../CoreRpcService';
import { ListingItemCreateParams } from '../../factories/model/ModelCreateParams';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { ActionMessageInterface } from '../../messages/action/ActionMessageInterface';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { MarketService } from '../model/MarketService';

export interface SellerMessage {
    hash: string;               // item hash being added
    address: string;            // seller address
}

export class ListingItemAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemAddMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ListingItemAddValidator) public validator: ListingItemAddValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory, validator);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param params
     */
    public async createMessage(params: ListingItemAddRequest): Promise<MarketplaceMessage> {

        // this.log.debug('createMessage, params: ', JSON.stringify(params, null, 2));
        const signature = await this.signSellerMessage(params.sendParams.wallet, params.seller.address, params.listingItem.hash);
        // this.log.debug('createMessage, signature: ', signature);

        const actionMessage: ListingItemAddMessage = await this.listingItemAddMessageFactory.get({
            // in this case this is actually the listingItemTemplate, as we use to create the message from both
            listingItem: params.listingItem,
            seller: params.seller,
            // cryptoAddress, we could override the payment address here
            signature
        } as ListingItemAddMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
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
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

    /**
     *
     *
     *
     * @param message
     * @param smsgMessage
     */
    public async verifyMessage(message: ActionMessageInterface, smsgMessage: resources.SmsgMessage): Promise<boolean> {

        const actionMessage = message as ListingItemAddMessage;

        if (_.isEmpty(actionMessage.item.seller)) {
            this.log.error('Missing seller data, likely a message from an old client.');
            return false;
        }

        // verify that the ListingItemAddMessage was actually sent by the seller
        const verified = await this.verifySellerMessage(actionMessage);
        if (!verified) {
            this.log.error('Received seller signature failed validation.');
            return false;
            // throw new MessageException('Received seller signature failed validation.');
        }

        // LISTINGITEM_ADD's should be allowed to send only from the publish address to the market receive address
        const market: resources.Market = await this.marketService.findAllByReceiveAddress(smsgMessage.to).then(value => value.toJSON()[0]);
        if (market.publishAddress !== smsgMessage.from) {
            // message was sent from an address which isnt allowed
            this.log.error('Invalid message sender.');
            return false;
            // throw new MessageException('Invalid message sender.');
        }

        return true;
    }

    /**
     * processListingItem "processes" the ListingItem, creating it.
     *
     * called from MessageListener.onEvent(), after the ListingItemAddMessage is received.
     *
     * TODO: add to BaseActionService
     *
     * @param message
     * @param smsgMessage
     */
    public async processMessage(message: ActionMessageInterface, smsgMessage: resources.SmsgMessage): Promise<SmsgMessageStatus> {

        const actionMessage = message as ListingItemAddMessage;

        // - if ListingItem contains a custom category, create them
        // - fetch the root category with related to create the listingItemCreateRequest
        // - create the ListingItem locally with the listingItemCreateRequest
        // - if there's a Proposal to remove the ListingItem, create a FlaggedItem related to the ListingItem
        // - if there's a matching ListingItemTemplate, create a relation

        // todo: custom categories not supported yet, this propably needs to be refactored
        const category: resources.ItemCategory = await this.itemCategoryService.createCustomCategoriesFromArray(
            smsgMessage.to, actionMessage.item.information.category);
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

    /**
     * signs message containing sellers address and ListingItem hash, proving the message is sent by the seller and with intended contents
     *
     * @param wallet
     * @param address
     * @param hash
     */
    private async signSellerMessage(wallet: string, address: string, hash:
        string): Promise<string> {
        const message = {
            address,
            hash
        } as SellerMessage;

        return await this.coreRpcService.signMessage(wallet, address, message);
    }

    /**
     * verifies SellerMessage, returns boolean
     *
     * @param listingItemAddMessage
     */
    private async verifySellerMessage(listingItemAddMessage: ListingItemAddMessage): Promise<boolean> {
        const message = {
            address: listingItemAddMessage.item.seller.address,
            hash: listingItemAddMessage.hash
        } as SellerMessage;
        return await this.coreRpcService.verifyMessage(listingItemAddMessage.item.seller.address, listingItemAddMessage.item.seller.signature, message);
    }


}
