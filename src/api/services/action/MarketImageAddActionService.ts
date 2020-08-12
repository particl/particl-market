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
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ompVersion } from 'omp-lib/dist/omp';
import { CoreRpcService } from '../CoreRpcService';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { MarketService } from '../model/MarketService';
import { ActionDirection } from '../../enums/ActionDirection';
import { NotificationService } from '../NotificationService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ListingItemImageAddRequest } from '../../requests/action/ListingItemImageAddRequest';
import { ListingItemImageAddMessage } from '../../messages/action/ListingItemImageAddMessage';
import { ListingItemImageAddMessageFactory } from '../../factories/message/ListingItemImageAddMessageFactory';
import { ListingItemImageAddMessageCreateParams } from '../../requests/message/ListingItemImageAddMessageCreateParams';
import { ListingItemImageAddValidator } from '../../messagevalidators/ListingItemImageAddValidator';
import { ItemImageService } from '../model/ItemImageService';
import { ItemImageDataService } from '../model/ItemImageDataService';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ItemImageDataCreateRequest } from '../../requests/model/ItemImageDataCreateRequest';
import { ItemImageUpdateRequest } from '../../requests/model/ItemImageUpdateRequest';
import { ListingItemImageNotification } from '../../messages/notification/ListingItemImageNotification';
import { VerifiableMessage } from './ListingItemAddActionService';

// todo: move
export interface ImageAddMessage extends VerifiableMessage {
    address: string;            // seller address
    hash: string;               // image hash being added
    target: string;             // listing hash the image is related to
}

export class MarketImageAddActionService extends BaseActionService {

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) public itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemImageAddMessageFactory) private listingItemImageAddMessageFactory: ListingItemImageAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ListingItemImageAddValidator) public validator: ListingItemImageAddValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super(MPActionExtended.MPA_MARKET_IMAGE_ADD,
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
    public async createMarketplaceMessage(actionRequest: ListingItemImageAddRequest): Promise<MarketplaceMessage> {

        const signature = await this.signImageMessage(actionRequest.sendParams.wallet, actionRequest.sellerAddress, actionRequest.image.hash,
            actionRequest.listingItem.hash);

        const actionMessage: ListingItemImageAddMessage = await this.listingItemImageAddMessageFactory.get({
            listingItem: actionRequest.listingItem,
            image: actionRequest.image,
            withData: true,
            signature
        } as ListingItemImageAddMessageCreateParams);

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
        return smsgSendResponse;
    }

    /**
     * processListingItem "processes" the incoming ListingItemImageAddMessage, updating the existing ItemImage with data.
     *
     * called from MessageListener.onEvent(), after the ListingItemImageAddMessage is received.
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

        const imageAddMessage: ListingItemImageAddMessage = marketplaceMessage.action as ListingItemImageAddMessage;

        if (ActionDirection.INCOMING === actionDirection) {

            // for all incoming messages, update the image data
            const itemImages: resources.ItemImage[] = await this.itemImageService.findAllByHash(imageAddMessage.hash).then(value => value.toJSON());

            for (const itemImage of itemImages) {

                const updateRequest = {
                    data: [{
                        dataId: imageAddMessage.data[0].dataId,
                        protocol: imageAddMessage.data[0].protocol,
                        encoding: imageAddMessage.data[0].encoding,
                        data: imageAddMessage.data[0].data,
                        imageVersion: ImageVersions.ORIGINAL.propName,  // we only need the ORIGINAL, other versions will be created automatically
                        imageHash: imageAddMessage.hash
                    }] as ItemImageDataCreateRequest[],
                    hash: imageAddMessage.hash,
                    featured: false     // TODO: add featured flag as param
                } as ItemImageUpdateRequest;

                // update the image with the real data
                await this.itemImageService.update(itemImage.id, updateRequest);
            }

        }

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        const imageAddMessage: ListingItemImageAddMessage = marketplaceMessage.action as ListingItemImageAddMessage;

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection) {

            // const itemImages: resources.ItemImage[] = await this.itemImageService.findAllByHash(imageAddMessage.hash).then(value => value.toJSON());
            // const listingItem: resources.ListingItem = await this.listingItemService.findOneByMsgId(smsgMessage.msgid).then(value => value.toJSON());

            const notification: MarketplaceNotification = {
                event: marketplaceMessage.action.type,
                payload: {
                    hash: imageAddMessage.hash,
                    listingItemHash: imageAddMessage.target
                } as ListingItemImageNotification
            };
            return notification;
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
     * signs message containing sellers address and ListingItem hash, proving the message is sent by the seller and with intended contents
     *
     * @param wallet
     * @param address
     * @param hash
     * @param target
     */
    private async signImageMessage(wallet: string, address: string, hash: string, target: string): Promise<string> {
        const message = {
            address,            // sellers address
            hash,               // image hash
            target              // item hash
        } as ImageAddMessage;

        return await this.coreRpcService.signMessage(wallet, address, message);
    }

}
