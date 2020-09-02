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
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { MarketService } from '../model/MarketService';
import { ActionDirection } from '../../enums/ActionDirection';
import { NotificationService } from '../NotificationService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ImageService } from '../model/ImageService';
import { ImageDataService } from '../model/ImageDataService';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageUpdateRequest } from '../../requests/model/ImageUpdateRequest';
import { MarketImageAddMessageFactory } from '../../factories/message/MarketImageAddMessageFactory';
import { MarketImageAddRequest } from '../../requests/action/MarketImageAddRequest';
import { MarketImageAddMessage } from '../../messages/action/MarketImageAddMessage';
import { MarketImageAddValidator } from '../../messagevalidators/MarketImageAddValidator';
import { MarketImageNotification } from '../../messages/notification/MarketImageNotification';

export class MarketImageAddActionService extends BaseActionService {

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.MarketImageAddMessageFactory) private actionMessageFactory: MarketImageAddMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.MarketImageAddValidator) public validator: MarketImageAddValidator,
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
    public async createMarketplaceMessage(actionRequest: MarketImageAddRequest): Promise<MarketplaceMessage> {
        actionRequest.withData = true;
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
     * processListingItem "processes" the incoming MarketImageAddMessage, updating the existing Image with data.
     *
     * called from MessageListener.onEvent(), after the MarketImageAddMessage is received.
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

        const imageAddMessage: MarketImageAddMessage = marketplaceMessage.action as MarketImageAddMessage;

        if (ActionDirection.INCOMING === actionDirection) {

            // for all incoming messages, update the image data
            // there could be several, since the same image could be used in multiple Markets/ListingItems.
            const itemImages: resources.Image[] = await this.imageService.findAllByHash(imageAddMessage.hash).then(value => value.toJSON());

            for (const itemImage of itemImages) {
                const updateRequest = {
                    data: [{
                        dataId: imageAddMessage.data[0].dataId,
                        protocol: imageAddMessage.data[0].protocol,
                        encoding: imageAddMessage.data[0].encoding,
                        data: imageAddMessage.data[0].data,
                        imageVersion: ImageVersions.ORIGINAL.propName,  // we only need the ORIGINAL, other versions will be created automatically
                        imageHash: imageAddMessage.hash
                    }] as ImageDataCreateRequest[],
                    hash: imageAddMessage.hash,
                    featured: false     // TODO: add featured flag as param
                } as ImageUpdateRequest;

                // update the image with the real data
                await this.imageService.update(itemImage.id, updateRequest);
            }

        }

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        const imageAddMessage: MarketImageAddMessage = marketplaceMessage.action as MarketImageAddMessage;

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection) {

            const notification: MarketplaceNotification = {
                event: marketplaceMessage.action.type,
                payload: {
                    hash: imageAddMessage.hash,
                    marketHash: imageAddMessage.target
                } as MarketImageNotification
            };
            return notification;
        }
        return undefined;
    }

}
