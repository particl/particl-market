// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidConfiguration, Cryptocurrency, MPM, ompVersion, OpenMarketProtocol } from 'omp-lib/dist/omp';
import { CoreRpcService } from './CoreRpcService';
import { ListingItemAddMessage } from '../messages/action/ListingItemAddMessage';
import { BidMessage } from '../messages/action/BidMessage';
import { EscrowLockMessage } from '../messages/action/EscrowLockMessage';
import { BidAcceptMessage } from '../messages/action/BidAcceptMessage';
import { ActionMessageInterface } from '../messages/action/ActionMessageInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import {Config} from 'omp-lib/dist/abstract/config';

export class OmpService {

    private static getMPM(message: ActionMessageInterface): MPM {
        return {
            action: message,
            version: ompVersion()
        } as MPM;
    }

    public log: LoggerType;
    public omp: OpenMarketProtocol;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        const ompConfig = { network: 'testnet'} as Config;
        this.omp = new OpenMarketProtocol(ompConfig);
        this.omp.inject(Cryptocurrency.PART, coreRpcService);
    }

    /**
     * Bid for a ListingItem
     *
     * @param config
     * @param listingItemAddMessage
     */
    public async bid(config: BidConfiguration, listingItemAddMessage: ListingItemAddMessage): Promise<MarketplaceMessage> {
        // rather than passing MPM's we're only accepting the action messages as params
        // MPM's contain the version, but we'd be generating the MPM's out of the data from the db, so we don't need to
        // be concerned the versions to be older and different for example
        return await this.omp.bid(
            config,
            OmpService.getMPM(listingItemAddMessage)
        ) as MarketplaceMessage;
    }

    /**
     * Accept a Bid
     *
     * @param listingItemAddMessage
     * @param bidMessage
     */
    public async accept(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage): Promise<MarketplaceMessage> {
        return await this.omp.accept(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage)
        ) as MarketplaceMessage;
    }

    /**
     * Lock the Bid in escrow
     *
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     */
    public async lock(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, bidAcceptMessage: BidAcceptMessage): Promise<MarketplaceMessage> {
        return await this.omp.lock(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage)
        ) as MarketplaceMessage;
    }

    public async complete(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, bidAcceptMessage: BidAcceptMessage,
                          escrowLockMessage: EscrowLockMessage): Promise<string> {
        return await this.omp.complete(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage),
            OmpService.getMPM(escrowLockMessage)
        );
    }

    public async release(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, bidAcceptMessage: BidAcceptMessage): Promise<string> {
        return await this.omp.release(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage)
        );
    }

    public async refund(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, bidAcceptMessage: BidAcceptMessage,
                        escrowLockMessage: EscrowLockMessage): Promise<string> {
        return await this.omp.complete(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage),
            OmpService.getMPM(escrowLockMessage)
        );
    }


}
