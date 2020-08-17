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
import { ListingItemAddValidator } from '../../messagevalidators/ListingItemAddValidator';
import { CoreRpcService } from '../CoreRpcService';
import { ItemCategoryService } from '../model/ItemCategoryService';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { ListingItemService } from '../model/ListingItemService';
import { ProposalService } from '../model/ProposalService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { ListingItemTemplateService } from '../model/ListingItemTemplateService';
import { MarketService } from '../model/MarketService';
import { ActionDirection } from '../../enums/ActionDirection';
import { NotificationService } from '../NotificationService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { MessageSize } from '../../responses/MessageSize';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { MarketAddRequest } from '../../requests/action/MarketAddRequest';
import { MarketAddMessageFactory } from '../../factories/message/MarketAddMessageFactory';
import { MarketAddMessage } from '../../messages/action/MarketAddMessage';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { MarketFactory } from '../../factories/model/MarketFactory';
import { MarketCreateParams } from '../../factories/model/ModelCreateParams';
import { MarketNotification } from '../../messages/notification/MarketNotification';


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
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.MarketFactory) public marketFactory: MarketFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.MarketAddMessageFactory) private actionMessageFactory: MarketAddMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ListingItemAddValidator) public validator: ListingItemAddValidator,
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
     * calculates the size of the MarketplaceMessage.
     * used to determine whether the MarketplaceMessage fits in the SmsgMessage size limits.
     *
     * @param actionRequest
     */
    public async calculateMarketplaceMessageSize(actionRequest: MarketAddRequest): Promise<MessageSize> {
        // todo: move to base class

        const marketplaceMessage = await this.createMarketplaceMessage(actionRequest);

        // this.log.debug('marketplacemessage: ', JSON.stringify(marketPlaceMessage, null, 2));
        const messageDataSize = JSON.stringify(marketplaceMessage).length;
        const spaceLeft = ListingItemTemplateService.MAX_SMSG_SIZE - messageDataSize;
        const fits = spaceLeft > 0;

        return {
            messageData: messageDataSize,
            imageData: 0,
            spaceLeft,
            fits
        } as MessageSize;
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
    public async beforePost(actionRequest: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        // this.log.debug('beforePost()');
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
                                actionRequest?: ListingItemAddRequest): Promise<resources.SmsgMessage> {

        this.log.debug('processMessage(), actionDirection: ', actionDirection);

        if (actionDirection === ActionDirection.INCOMING) {

            // we're creating the market only when it arrives
            const marketAddMessage: MarketAddMessage = marketplaceMessage.action as MarketAddMessage;

            const createRequest: MarketCreateRequest = await this.marketFactory.get({
                actionMessage: marketAddMessage,
                smsgMessage
            } as MarketCreateParams);

            const market: resources.Market = await this.marketService.findOneByHash(createRequest.hash)
                .then(async value => value.toJSON())
                .catch(async reason => {
                    return await this.marketService.create(createRequest).then(async value => value.toJSON());
                });

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
                return await this.createFlaggedItemForMarket(market, proposal);
            })
            .catch(reason => {
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
