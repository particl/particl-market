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
import { CoreRpcService } from './CoreRpcService';

import { Output } from 'resources';
import {MessageException} from '../exceptions/MessageException';

export class BidActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
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
    public async send( listingItem: resources.ListingItem, params: any[] ): Promise<SmsgSendResponse> {

        // Get unspent
        const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
        const outputs: Output[] = [];
        const listingItemPrice = listingItem.PaymentInformation.ItemPrice;
        const basePrice = listingItemPrice.basePrice;
        const shippingPriceMax = Math.max(
            listingItemPrice.ShippingPrice.international,
            listingItemPrice.ShippingPrice.domestic);
        const totalPrice = basePrice + shippingPriceMax;

        let sum = 0;
        let change = 0;

        if (basePrice) {
            unspent.find(output => {
                if (output.spendable && output.solvable) {
                    sum += output.amount;
                    outputs.push({
                        txid: output.txid,
                        vout: output.vout,
                        amount: output.amount
                    });
                }
                if (sum > (totalPrice * 2)) { // TODO: Ratio
                    change = +(sum - (totalPrice * 2) - 0.0002).toFixed(8); // TODO: Get actual fee...
                    return true;
                }
                return false;
            });

            if (sum < basePrice) {
                throw new MessageException('You are too broke...');
            }
        } else {
            throw new MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
        }

        const addr = await this.coreRpcService.call('getaccountaddress', ['_escrow_pub_' + listingItem.hash]);
        const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']);
        const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

        // convert the bid data params as bid data key value pair
        const bidData = this.getBidData(params.concat([
            'outputs', outputs, 'pubkeys', [pubkey], 'changeAddr', changeAddr, 'change', change
        ]));

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
        return await this.smsgService.smsgSend(profile.address, market.address, marketPlaceMessage);
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

    /**
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     * ..........
     */
    private getBidData(data: string[]): string[] {
        const bidData = [] as any;

        // convert the bid data params as bid data key value pair
        for ( let i = 0; i < data.length; i += 2 ) {
            bidData.push({id: data[i], value: data[i + 1]});
        }
        return bidData;
    }

}
