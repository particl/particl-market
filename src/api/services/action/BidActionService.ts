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
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidAcceptMessageFactory } from '../../factories/message/BidAcceptMessageFactory';
import { BidRejectMessageFactory } from '../../factories/message/BidRejectMessageFactory';
import { BidCancelMessageFactory } from '../../factories/message/BidCancelMessageFactory';
import { BidMessageFactory } from '../../factories/message/BidMessageFactory';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { BidRequest } from '../../requests/post/BidRequest';
import { request, validate } from '../../../core/api/Validate';
import { ListingItemAddRequest } from '../../requests/post/ListingItemAddRequest';

export class BidActionService extends BaseActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
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
     * @param params
     */
    public async createMessage(params: BidRequest): Promise<MarketplaceMessage> {
        return {} as MarketplaceMessage;
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     * @param message
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return true;
    }

    /**
     * this is implemented in the abstract class, just doing some logging here
     *
     * @param params
     */
    @validate()
    public async post(@request(ListingItemAddRequest) params: ListingItemAddRequest): Promise<SmsgSendResponse> {
        this.log.debug('post(): ', JSON.stringify(params, null, 2));
        return super.post(params);
    }

    /**
     * handles the received BidMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {
        return SmsgMessageStatus.PROCESSED;
    }


}
