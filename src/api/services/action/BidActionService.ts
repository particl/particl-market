// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { ompVersion } from 'omp-lib';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { EventEmitter } from 'events';
import { BidService } from '../model/BidService';
import { ProfileService } from '../model/ProfileService';
import { MarketService } from '../model/MarketService';
import { BidFactory } from '../../factories/model/BidFactory';
import { SmsgService } from '../SmsgService';
import { CoreRpcService } from '../CoreRpcService';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { OrderService } from '../model/OrderService';
import { BidDataService } from '../model/BidDataService';
import { LockedOutputService } from '../model/LockedOutputService';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import { BidAcceptMessageFactory } from '../../factories/message/BidAcceptMessageFactory';
import { BidRejectMessageFactory } from '../../factories/message/BidRejectMessageFactory';
import { BidCancelMessageFactory } from '../../factories/message/BidCancelMessageFactory';
import { BidMessageFactory } from '../../factories/message/BidMessageFactory';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { BidRequest } from '../../requests/post/BidRequest';
import { request, validate } from '../../../core/api/Validate';
import { ListingItemAddRequest } from '../../requests/post/ListingItemAddRequest';
import { ListingItemAddActionService } from './ListingItemAddActionService';
import { MessageSendParams } from '../../requests/params/MessageSendParams';
import { OmpService } from '../OmpService';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BidValidator } from '../../messages/validator/BidValidator';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidCreateParams } from '../../factories/model/ModelCreateParams';
import { MessageException } from '../../exceptions/MessageException';
import {HashMismatchException} from '../../exceptions/HashMismatchException';

export class BidActionService extends BaseActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.BidDataService) public bidDataService: BidDataService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.LockedOutputService) public lockedOutputService: LockedOutputService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.message.BidMessageFactory) public bidMessageFactory: BidMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidAcceptMessageFactory) public bidAcceptMessageFactory: BidAcceptMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidRejectMessageFactory) public bidRejectMessageFactory: BidRejectMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidCancelMessageFactory) public bidCancelMessageFactory: BidCancelMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_BID, smsgService, smsgMessageService, smsgMessageFactory, eventEmitter);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - recreate ListingItemMessage with factory
     * - use omp to generate BidMessage
     *
     * @param params
     */
    public async createMessage(params: BidRequest): Promise<MarketplaceMessage> {
        const listingItemAddMPM: MarketplaceMessage = await this.listingItemAddActionService.createMessage({
            sendParams: {} as MessageSendParams, // not needed, this message is not sent
            listingItem: params.listingItem
        } as ListingItemAddRequest);

        // todo: validate listingItemAddMPM hash?

        const config: BidConfiguration = {
            cryptocurrency: Cryptocurrency.PART,
            escrow: params.listingItem.PaymentInformation.Escrow.type,
            shippingAddress: params.address
            // objects: KVS[] // product variations etc bid related params
        };

        // use omp to generate BidMessage
        return await this.ompService.bid(config, listingItemAddMPM.action as ListingItemAddMessage);
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network.
     * called directly after createMessage to validate the creation.
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return BidValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     * - save the Bid in the Database
     * - make sure the saved Bid.hash and messages hash match
     * TODO: create the Order too
     *
     * @param params
     * @param bidMarketplaceMessage
     */
    public async beforePost(params: BidRequest, bidMarketplaceMessage: MarketplaceMessage): Promise<BidRequest> {

        // todo: should we set the latestBid in the case the previous Bid was cancelled or rejected?

        return await this.bidFactory.get(bidMarketplaceMessage.action as BidMessage, {
                listingItem: params.listingItem,
                address: params.address,
                bidder: params.sendParams.fromAddress
                // latestBid: undefined
            } as BidCreateParams)
            .then(async bidCreateRequest => {
                const bid: resources.Bid = await this.bidService.create(bidCreateRequest)
                    .then(value => value.toJSON());

                // the saved Bid.hash should match with the hash in outgoing message
                if (bid.hash !== bidMarketplaceMessage.action.hash) {
                    throw new HashMismatchException('BidMessage');
                }

                // TODO: create Order

                return params;
            });
    }

    /**
     * this is implemented in the abstract class, just doing some logging here
     *
     * @param params
     */
    @validate()
    public async post(@request(BidRequest) params: BidRequest): Promise<SmsgSendResponse> {
        this.log.debug('post(): ', JSON.stringify(params, null, 2));
        return super.post(params);
    }

    /**
     * handles the received BidMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: BidMessage = marketplaceMessage.action as BidMessage;

        // - first get the ListingItem the Bid is for, fail if it doesn't exist


        return await this.listingItemService.findOneByHash(actionMessage.item)
            .then(async listingItemModel => {
                const listingItem = listingItemModel.toJSON();

                // make sure the ListingItem belongs to a local Profile
                if (_.isEmpty(listingItem.ListingItemTemplate.Profile)) {
                    throw new MessageException('Received a Bid for a ListingItem not belonging to a local Profile.');
                }

                // TODO: should someone be able to bid more than once?
                // TODO: for that to be possible, we need to be able to identify different bids from one address
                // -> needs bid.hash
                // TODO: when testing locally, bid gets created first for the bidder after which it can be found here when receiving the bid


                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                // TODO: user is receiving a Bid for his own ListingItem, so if it not found, something is seriously wrong.
                // maybe he deleted the db, or for some reason never received his own message?
                return SmsgMessageStatus.WAITING;
            });


    }


}
