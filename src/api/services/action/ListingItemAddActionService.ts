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
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddValidator } from '../../messagevalidators/ListingItemAddValidator';
import { ompVersion } from 'omp-lib/dist/omp';
import { ListingItemAddMessageFactory } from '../../factories/message/ListingItemAddMessageFactory';
import { ListingItemAddMessageCreateParams } from '../../requests/message/ListingItemAddMessageCreateParams';
import { CoreRpcService } from '../CoreRpcService';
import { ListingItemCreateParams } from '../../factories/model/ModelCreateParams';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { MarketService } from '../model/MarketService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { NotificationService } from '../NotificationService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { NotificationType } from '../../enums/NotificationType';
import { ListingItemNotification } from '../../messages/notification/ListingItemNotification';
import { ListingItemCreateRequest } from '../../requests/model/ListingItemCreateRequest';
import { MessageSize } from '../../responses/MessageSize';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { MissingParamException } from '../../exceptions/MissingParamException';

export interface VerifiableMessage {
    // not empty
}

export interface SellerMessage extends VerifiableMessage {
    hash: string;               // item hash being added
    address: string;            // seller address
}

export class ListingItemAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
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
        super(MPAction.MPA_LISTING_ADD,
            smsgService,
            smsgMessageService,
            notificationService,
            smsgMessageFactory,
            validator,
            Logger
        );
    }

    /**
     * calculates the size of the MarketplaceMessage for given ListingItemTemplate.
     * used to determine whether the MarketplaceMessage fits in the SmsgMessage size limits.
     *
     * @param listingItemTemplate
     * @param seller
     * @param market
     */
    public async calculateMarketplaceMessageSize(listingItemTemplate: resources.ListingItemTemplate, market: resources.Market): Promise<MessageSize> {

        const marketplaceMessage = await this.createMarketplaceMessage({
            sendParams: {
                wallet: market.Identity.wallet
            } as SmsgSendParams,
            listingItem: listingItemTemplate,
            market,
            seller: market.Identity
        } as ListingItemAddRequest);

        // this.log.debug('marketplacemessage: ', JSON.stringify(marketPlaceMessage, null, 2));

        // let imageDataSize = 0;
        // if (action.item.information.images) {
        //     for (const image of action.item.information.images) {
        //         imageDataSize = imageDataSize + image.data[0].data.length;
        //         this.log.debug('imageDataSize: ', image.data[0].data.length);
        //     }
        // }
        const messageDataSize = JSON.stringify(marketplaceMessage).length; // - imageDataSize;
        const spaceLeft = ListingItemTemplateService.MAX_SMSG_SIZE - messageDataSize; // - imageDataSize;
        const fits = spaceLeft > 0;

        return {
            messageData: messageDataSize,
            imageData: 0, // imageDataSize,
            spaceLeft,
            fits
        } as MessageSize;
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: ListingItemAddRequest): Promise<MarketplaceMessage> {

        const signature = await this.signSellerMessage(actionRequest.sendParams.wallet, actionRequest.seller.address, actionRequest.listingItem.hash);

        const actionMessage: ListingItemAddMessage = await this.listingItemAddMessageFactory.get({
            // in this case this is actually the listingItemTemplate, as we use to create the message from both
            listingItem: actionRequest.listingItem,
            seller: actionRequest.seller,
            // cryptoAddress, we could override the payment address here
            signature
        } as ListingItemAddMessageCreateParams);

        // this.log.debug('createMarketplaceMessage(), actionMessage.item: ', JSON.stringify(actionMessage.item, null, 2));

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * called before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        this.log.debug('beforePost()');
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        this.log.debug('afterPost()');
        return smsgSendResponse;
    }

    /**
     * processListingItem "processes" the ListingItem, creating it.
     *
     * called from MessageListener.onEvent(), after the ListingItemAddMessage is received.
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: ListingItemAddRequest): Promise<resources.SmsgMessage> {

        this.log.debug('processMessage(), actionDirection: ', actionDirection);

        if (actionDirection === ActionDirection.INCOMING) {
            // we're creating the listingitem only when it arrives
            const listingItemAddMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

            // if ListingItem contains a custom category, create them
            await this.itemCategoryService.createMarketCategoriesFromArray(smsgMessage.to, listingItemAddMessage.item.information.category);

            // fetch the root category used to create the listingItemCreateRequest
            const rootCategory: resources.ItemCategory = await this.itemCategoryService.findRoot(smsgMessage.to).then(value => value.toJSON());

            const listingItemCreateParams = {
                msgid: smsgMessage.msgid,
                market: smsgMessage.to,
                rootCategory
            } as ListingItemCreateParams;

            this.log.debug('processMessage(), listingItemCreateParams: ', JSON.stringify(listingItemCreateParams, null, 2));
            this.log.debug('processMessage(), listingItemAddMessage: ', JSON.stringify(listingItemAddMessage, null, 2));
            this.log.debug('processMessage(), smsgMessage: ', JSON.stringify(smsgMessage, null, 2));

            const listingItemCreateRequest: ListingItemCreateRequest = await this.listingItemFactory.get(listingItemCreateParams,
                listingItemAddMessage, smsgMessage);

            this.log.debug('processMessage(), listingItemCreateRequest: ', JSON.stringify(listingItemCreateRequest, null, 2));

            // - create the ListingItem locally with the listingItemCreateRequest
            await this.listingItemService.create(listingItemCreateRequest)
                .then(async value => {
                    const listingItem: resources.ListingItem = value.toJSON();

                    // - if there's a Proposal to remove the ListingItem, create a FlaggedItem related to the ListingItem
                    await this.createFlaggedItemIfNeeded(listingItem);

                    // - if there's a matching ListingItemTemplate, create a relation
                    await this.updateListingItemAndTemplateRelationIfNeeded(listingItem);

                    this.log.debug('PROCESSED: ' + smsgMessage.msgid + ' / ' + listingItem.id + ' / ' + listingItem.hash);
                    return SmsgMessageStatus.PROCESSED;

                })
                .catch(reason => {
                    this.log.error('PROCESSING FAILED: ', smsgMessage.msgid);
                    return SmsgMessageStatus.PROCESSING_FAILED;
                });
        }

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection) {

            const listingItem: resources.ListingItem = await this.listingItemService.findOneByMsgId(smsgMessage.msgid)
                .then(value => value.toJSON())
                .catch(err => undefined);

            if (listingItem) {
                const notification: MarketplaceNotification = {
                    event: NotificationType[marketplaceMessage.action.type],    // TODO: NotificationType could be replaced with ActionMessageTypes
                    payload: {
                        id: listingItem.id,
                        hash: listingItem.hash,
                        seller: listingItem.seller,
                        market: listingItem.market
                    } as ListingItemNotification
                };
                return notification;
            }
        }
        return undefined;
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
    private async signSellerMessage(wallet: string, address: string, hash: string): Promise<string> {
        if (_.isEmpty(wallet)) {
            throw new MissingParamException('wallet');
        }
        if (_.isEmpty(address)) {
            throw new MissingParamException('address');
        }
        if (_.isEmpty(hash)) {
            throw new MissingParamException('hash');
        }
        const message = {
            address,        // seller address
            hash            // item hash
        } as SellerMessage;

        this.log.debug('signSellerMessage(), message: ', JSON.stringify(message, null, 2));

        this.log.debug('signSellerMessage(), address: ', address);
        this.log.debug('signSellerMessage(), hash: ', hash);

        return await this.coreRpcService.signMessage(wallet, address, message);
    }

}
