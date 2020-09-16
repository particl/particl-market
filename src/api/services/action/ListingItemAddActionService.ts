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
import { ListingItemAddMessageFactory } from '../../factories/message/ListingItemAddMessageFactory';
import { CoreRpcService } from '../CoreRpcService';
import { ListingItemCreateParams } from '../../factories/ModelCreateParams';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { MarketService } from '../model/MarketService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import { NotificationService } from '../NotificationService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { ListingItemNotification } from '../../messages/notification/ListingItemNotification';
import { ListingItemCreateRequest } from '../../requests/model/ListingItemCreateRequest';
import { MessageSize } from '../../responses/MessageSize';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ImageService } from '../model/ImageService';


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
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private actionMessageFactory: ListingItemAddMessageFactory,
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
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: ListingItemAddRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
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
     * processMessage "processes" the ListingItem, creating it.
     *
     * called from MessageListener.onEvent(), after the ListingItemAddMessage is received.
     * ListingItems are created only when messages are received.
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

            const actionMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

            // if ListingItem contains a custom category, create it if needed
            const itemCategory: resources.ItemCategory = await this.itemCategoryService.createMarketCategoriesFromArray(smsgMessage.to,
                actionMessage.item.information.category);

            const createRequest: ListingItemCreateRequest = await this.listingItemFactory.get({
                actionMessage,
                smsgMessage,
                categoryId: itemCategory.id
            } as ListingItemCreateParams);

            // some of the ListingItems Images might have already been received, so we dont need to create them
            const existingImages: resources.Image[] = await this.imageService.findAllByTarget(createRequest.hash).then(value => value.toJSON());
            for (const existingImage of existingImages) {
                // then remove existing Image from the ListingItemCreateRequest
                _.remove(createRequest.itemInformation.images, (imageCR) => {
                    return imageCR.hash === existingImage.hash;
                });
            }

            // create the ListingItem
            await this.listingItemService.create(createRequest)
                .then(async listingValue => {
                    const listingItem: resources.ListingItem = listingValue.toJSON();

                    // update the relations for the existing Images
                    for (const existingImage of existingImages) {
                        await this.imageService.updateItemInformation(existingImage.id, listingItem.ItemInformation.id).then(imageValue => imageValue.toJSON());
                    }

                    // if there's a Proposal to remove the ListingItem, create a FlaggedItem related to the ListingItem
                    await this.createFlaggedItemIfNeeded(listingItem);

                    // if there's a matching ListingItemTemplate, create a relation
                    await this.updateListingItemAndTemplateRelationIfNeeded(listingItem);

                    this.log.debug('CREATED: ' + smsgMessage.msgid + ' / ' + listingItem.id + ' / ' + listingItem.hash);

                })
                .catch(reason => {
                    this.log.error('FAILED: ' + smsgMessage.msgid + ' : ' + reason);
                    throw reason;
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
                    event: marketplaceMessage.action.type,
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
        await this.proposalService.findOneByTarget(listingItem.hash)
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
