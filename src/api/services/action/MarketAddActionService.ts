// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import { CoreRpcService } from '../CoreRpcService';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { MarketService } from '../model/MarketService';
import { ActionDirection } from '../../enums/ActionDirection';
import { NotificationService } from '../NotificationService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { MarketAddRequest } from '../../requests/action/MarketAddRequest';
import { MarketAddMessageFactory } from '../../factories/message/MarketAddMessageFactory';
import { MarketAddMessage } from '../../messages/action/MarketAddMessage';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { MarketFactory } from '../../factories/model/MarketFactory';
import { MarketCreateParams } from '../../factories/ModelCreateParams';
import { MarketNotification } from '../../messages/notification/MarketNotification';
import { MarketAddValidator } from '../../messagevalidators/MarketAddValidator';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { ImageService } from '../model/ImageService';
import { MarketType } from '../../enums/MarketType';
import { PublicKey, PrivateKey, Networks } from 'particl-bitcore-lib';


export class MarketAddActionService extends BaseActionService {

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
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.MarketFactory) public marketFactory: MarketFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.MarketAddMessageFactory) private actionMessageFactory: MarketAddMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.MarketAddValidator) public validator: MarketAddValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPActionExtended.MPA_MARKET_ADD,
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
    public async createMarketplaceMessage(actionRequest: MarketAddRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: MarketAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        this.log.debug('beforePost()');

        // convert MarketType.STOREFRONT_ADMIN to MarketType.STOREFRONT
        const marketAddMessage: MarketAddMessage = marketplaceMessage.action as MarketAddMessage;
        if (marketAddMessage.marketType === MarketType.STOREFRONT_ADMIN) {
            // publish private key -> public key
            marketAddMessage.marketType = MarketType.STOREFRONT;
            marketAddMessage.publishKey = PrivateKey.fromWIF(marketAddMessage.publishKey).toPublicKey().toString();
        }
        return await this.actionMessageFactory.getMarketplaceMessage(marketAddMessage);
    }

    /**
     * called after post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: MarketAddRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        // this.log.debug('afterPost()');
        return smsgSendResponse;
    }

    /**
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: MarketAddRequest): Promise<resources.SmsgMessage> {

        this.log.debug('processMessage(), actionDirection: ', actionDirection);

        if (actionDirection === ActionDirection.INCOMING) {

            // we're creating the market only when it arrives
            const marketAddMessage: MarketAddMessage = marketplaceMessage.action as MarketAddMessage;

            const createRequest: MarketCreateRequest = await this.marketFactory.get({
                actionMessage: marketAddMessage,
                smsgMessage,
                skipJoin: false
            } as MarketCreateParams);

            // this.log.debug('processMessage(), createRequest: ', JSON.stringify(createRequest, null, 2));

            // Image for the Market might have already been received
            const existingImages: resources.Image[] = await this.imageService.findAllByTarget(createRequest.hash).then(value => value.toJSON());
            this.log.debug('processMessage(), existingImages: ' + existingImages.length + ', for market.hash: ' + createRequest.hash);

            for (const existingImage of existingImages) {
                // then remove existing Image from the MarketCreateRequest if theres a match
                if (createRequest.hash === existingImage.target) {
                    // market hash matches the existing image target market hash
                    delete createRequest.image;
                }
            }

            // this.log.debug('processMessage(), createRequest: ', JSON.stringify(createRequest, null, 2));

            const market: resources.Market = await this.marketService.create(createRequest).then(value => value.toJSON());
            for (const existingImage of existingImages) {
                await this.marketService.updateImage(market.id, existingImage.id).then(value => {
                    this.log.debug('updated, image: ' + existingImage.id + ', for market: ' + market.id + '.');
                });
            }
            // this.log.debug('processMessage(), market: ', JSON.stringify(market, null, 2));

            await this.createFlaggedItemIfNeeded(market);
        }

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection) {

            const market: resources.Market = await this.marketService.findOneByMsgId(smsgMessage.msgid)
                .then(value => value.toJSON())
                .catch(err => undefined);

            if (market) {
                const notification: MarketplaceNotification = {
                    event: marketplaceMessage.action.type,
                    payload: {
                        id: market.id,
                        hash: market.hash,
                        name: market.name
                    } as MarketNotification
                };
                return notification;
            }
        }
        return undefined;
    }


    /**
     * If a Proposal to remove the Market is found, create FlaggedItem
     *
     * @param market
     */
    private async createFlaggedItemIfNeeded(market: resources.Market): Promise<resources.FlaggedItem | void> {
        await this.proposalService.findOneByTarget(market.hash)
            .then(async value => {
                const proposal: resources.Proposal = value.toJSON();
                this.log.debug('createFlaggedItemIfNeeded(), found proposal: ', proposal.id);
                return await this.createFlaggedItemForMarket(market, proposal);
            })
            .catch(reason => {
                this.log.debug('Market is not flagged.');
                return null;
            });
    }

    /**
     * Create FlaggedItem for Market having a Proposal to remove it
     *
     * @param market
     * @param {module:resources.Proposal} proposal
     * @returns {Promise<module:resources.FlaggedItem>}
     */
    private async createFlaggedItemForMarket(market: resources.Market, proposal: resources.Proposal): Promise<resources.FlaggedItem> {
        const flaggedItemCreateRequest = {
            market_id: market.id,
            proposal_id: proposal.id,
            reason: proposal.description
        } as FlaggedItemCreateRequest;

        return await this.flaggedItemService.create(flaggedItemCreateRequest).then(value => value.toJSON());
    }

}
