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
import { ListingItemImageAddValidator } from '../../messagevalidators/ListingItemImageAddValidator';
import { ImageService } from '../model/ImageService';
import { ImageDataService } from '../model/ImageDataService';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageUpdateRequest } from '../../requests/model/ImageUpdateRequest';
import { ListingItemImageNotification } from '../../messages/notification/ListingItemImageNotification';
import { ImageCreateParams } from '../../factories/model/ModelCreateParams';
import { ImageFactory } from '../../factories/model/ImageFactory';


export class ListingItemImageAddActionService extends BaseActionService {

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemImageAddMessageFactory) private actionMessageFactory: ListingItemImageAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ImageFactory) public imageFactory: ImageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ListingItemImageAddValidator) public validator: ListingItemImageAddValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super(MPActionExtended.MPA_LISTING_IMAGE_ADD,
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
        return await this.actionMessageFactory.get(actionRequest);
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
     * processListingItem "processes" the incoming ListingItemImageAddMessage, updating the existing Image with data.
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

        const actionMessage: ListingItemImageAddMessage = marketplaceMessage.action as ListingItemImageAddMessage;

        if (ActionDirection.INCOMING === actionDirection) {

            // for all incoming messages, update the image data if found
            const images: resources.Image[] = await this.imageService.findAllByHashAndTarget(actionMessage.hash, actionMessage.target)
                .then(value => value.toJSON());
            this.log.debug('images exist:', images.length);

            if (!_.isEmpty(images)) {

                for (const image of images) {

                    // todo: use factory
                    const updateRequest = {
                        data: [{
                            dataId: actionMessage.data[0].dataId,
                            protocol: actionMessage.data[0].protocol,
                            encoding: actionMessage.data[0].encoding,
                            data: actionMessage.data[0].data,
                            imageVersion: ImageVersions.ORIGINAL.propName,  // we only need the ORIGINAL, other versions will be created automatically
                            imageHash: actionMessage.hash
                        }] as ImageDataCreateRequest[],
                        hash: actionMessage.hash,
                        featured: actionMessage.featured,
                        target: actionMessage.target,
                        msgid: smsgMessage.msgid,
                        generatedAt: actionMessage.generated,
                        postedAt: smsgMessage.sent,
                        receivedAt: smsgMessage.received
                    } as ImageUpdateRequest;

                    // update the image with the real data
                    await this.imageService.update(image.id, updateRequest).then(value => {
                        this.log.debug('updated: ', JSON.stringify(value.toJSON(), null, 2));
                    });
                }
            } else {
                this.log.debug('image: ' + actionMessage.hash + ', for market: ' + actionMessage.target + ', doesnt exist yet.');
                const createRequest = await this.imageFactory.get({
                    actionMessage,
                    smsgMessage
                } as ImageCreateParams);
                await this.imageService.create(createRequest).then(value => {
                    this.log.debug('created: ', JSON.stringify(value.toJSON(), null, 2));
                });
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

            // const images: resources.Image[] = await this.imageService.findAllByHash(imageAddMessage.hash).then(value => value.toJSON());
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

}
