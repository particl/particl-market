import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

import { EventEmitter } from 'events';
import { ActionMessageService } from './ActionMessageService';
import { BidService } from './BidService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { Market } from '../models/Market';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { BidFactory } from '../factories/BidFactory';
import { BidMessageType } from '../enums/BidMessageType';
import { SmsgService } from './SmsgService';

export class BidActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.BidService) public bidService: BidService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * Posts a Bid to the network
     *
     * @param data
     * @returns {Promise<void>}
     */
    public async send( listingItem: resources.ListingItem, bidData: any[] ): Promise<SmsgSendResponse> {

        // fetch the profile
        const profileModel = await this.profileService.getDefault();
        const profile = profileModel.toJSON();

        // fetch the market
        const marketModel: Market = await this.marketService.findOne(listingItem.Market.id);
        const market = marketModel.toJSON();

        const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_BID, listingItem.hash, bidData);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: bidMessage
        } as MarketplaceMessage;

        this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

        // broadcast the message in to the network
        return await this.smsgService.smsgSend(profile.address, market.address, marketPlaceMessage, false);
    }

    /**
     * process received BidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received AcceptBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processCancelBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received RejectBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processRejectBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.BidReceivedEvent, async (event) => {
            await this.processBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.AcceptBidReceivedEvent, async (event) => {
            await this.processAcceptBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.CancelBidReceivedEvent, async (event) => {
            await this.processCancelBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RejectBidReceivedEvent, async (event) => {
            await this.processRejectBidReceivedEvent(event);
        });
    }

}
