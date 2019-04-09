// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidConfiguration, Cryptocurrency, MPM, ompVersion, OpenMarketProtocol } from 'omp-lib/dist/omp';
import { CoreRpcService } from './CoreRpcService';
import { ListingItemAddMessage } from '../messages/action/ListingItemAddMessage';
import { BidMessage } from '../messages/action/BidMessage';
import { EscrowLockMessage } from '../messages/action/EscrowLockMessage';
import { BidAcceptMessage } from '../messages/action/BidAcceptMessage';
import { EscrowRefundMessage } from '../messages/action/EscrowRefundMessage';
import { EscrowReleaseMessage } from '../messages/action/EscrowReleaseMessage';
import { ActionMessageInterface } from '../messages/action/ActionMessageInterface';

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
        this.omp = new OpenMarketProtocol();
        this.omp.inject(Cryptocurrency.PART, coreRpcService);
    }

    /**
     * Bid for a ListingItem
     *
     * @param config
     * @param listingItemAddMessage
     */
    public async bid(config: BidConfiguration, listingItemAddMessage: ListingItemAddMessage): Promise<MPM> {
        // rather than passing MPM's we're only accepting the action messages as params
        // MPM's contain the version, but we'd be generating the MPM's out of the data from the db, so we don't need to
        // be concerned the versions to be older and different for example
        return await this.omp.bid(
            config,
            OmpService.getMPM(listingItemAddMessage)
        );
    }

    /**
     * Accept a Bid
     *
     * @param listingItemAddMessage
     * @param bidMessage
     */
    public async accept(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage): Promise<MPM> {
        return await this.omp.accept(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage)
        );
    }

    /**
     * Lock the Bid in escrow
     *
     * @param listingItemAddMessage
     * @param bidMessage
     * @param escrowLockMessage
     */
    public async lock(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, escrowLockMessage: EscrowLockMessage): Promise<MPM> {
        return await this.omp.lock(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(escrowLockMessage)
        );
    }

    /**
     * Refund the Bid
     *
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     * @param escrowRefundMessage
     */
    public async refund(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, bidAcceptMessage: BidAcceptMessage,
                        escrowRefundMessage?: EscrowRefundMessage): Promise<MPM> {
        return await this.omp.refund(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage),
            escrowRefundMessage ? OmpService.getMPM(escrowRefundMessage) : undefined
        );
    }

    /**
     * Release the Bid from Escrow
     *
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     * @param escrowReleaseMessage
     */
    public async release(listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage, bidAcceptMessage: BidAcceptMessage,
                         escrowReleaseMessage?: EscrowReleaseMessage): Promise<MPM> {
        return await this.omp.release(
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage),
            escrowReleaseMessage ? OmpService.getMPM(escrowReleaseMessage) : undefined
        );
    }

}
