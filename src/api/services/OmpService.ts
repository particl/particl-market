// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import { ActionMessageInterface } from '../messages/action/ActionMessageInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { Config } from 'omp-lib/dist/abstract/config';
import { RpcBlockchainInfo } from 'omp-lib/dist/interfaces/rpc';

export class OmpService {

    public static getMPM(message: ActionMessageInterface): MPM {
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
        this.initializeOmp(coreRpcService);
    }

    /**
     * Bid for a ListingItem
     *
     * @param wallet
     * @param config
     * @param listingItemAddMessage
     */
    public async bid(wallet: string, config: BidConfiguration, listingItemAddMessage: ListingItemAddMessage): Promise<MarketplaceMessage> {
        // rather than passing MPM's we're only accepting the action messages as params
        // MPM's contain the version, but we'd be generating the MPM's out of the data from the db, so we don't need to
        // be concerned the versions to be older and different for example
        return await this.omp.bid(
            wallet,
            config,
            OmpService.getMPM(listingItemAddMessage)
        ) as MarketplaceMessage;
    }

    /**
     * Accept a Bid
     *
     * @param wallet
     * @param listingItemAddMessage
     * @param bidMessage
     */
    public async accept(wallet: string, listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage): Promise<MarketplaceMessage> {
        const listingMPM: MPM = OmpService.getMPM(listingItemAddMessage);
        const bidMPM: MPM = OmpService.getMPM(bidMessage);

        this.log.debug('accept(), listingMPM: ', JSON.stringify(listingMPM, null, 2));
        this.log.debug('accept(), bidMPM: ', JSON.stringify(bidMPM, null, 2));

        return await this.omp.accept(
            wallet,
            listingMPM,
            bidMPM
        ) as MarketplaceMessage;
    }

    /**
     * Lock the Bid in escrow
     *
     * @param wallet
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     */
    public async lock(wallet: string, listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage,
                      bidAcceptMessage: BidAcceptMessage): Promise<MarketplaceMessage> {
        return await this.omp.lock(
            wallet,
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage)
        ) as MarketplaceMessage;
    }

    /**
     *
     * @param wallet
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     * @param escrowLockMessage
     */
    public async complete(wallet: string, listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage,
                          bidAcceptMessage: BidAcceptMessage, escrowLockMessage: EscrowLockMessage): Promise<string> {
        return await this.omp.complete(
            wallet,
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage),
            OmpService.getMPM(escrowLockMessage)
        );
    }

    /**
     *
     * @param wallet
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     */
    public async release(wallet: string, listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage,
                         bidAcceptMessage: BidAcceptMessage): Promise<string> {
        return await this.omp.release(
            wallet,
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage)
        );
    }

    /**
     *
     * @param wallet
     * @param listingItemAddMessage
     * @param bidMessage
     * @param bidAcceptMessage
     * @param escrowLockMessage
     */
    public async refund(wallet: string, listingItemAddMessage: ListingItemAddMessage, bidMessage: BidMessage,
                        bidAcceptMessage: BidAcceptMessage, escrowLockMessage: EscrowLockMessage): Promise<string> {
        return await this.omp.complete(
            wallet,
            OmpService.getMPM(listingItemAddMessage),
            OmpService.getMPM(bidMessage),
            OmpService.getMPM(bidAcceptMessage),
            OmpService.getMPM(escrowLockMessage)
        );
    }

    /**
     *
     * @param coreRpcService
     */
    private initializeOmp(coreRpcService: CoreRpcService): void {
        coreRpcService.isConnected().then((connected) => {
            if (!connected) {
                setTimeout(() => {
                    this.initializeOmp(coreRpcService);
                }, 500, coreRpcService);
                return;
            }
            coreRpcService.getBlockchainInfo().then(
                (blockInfo: RpcBlockchainInfo) => {
                    const chain = `${blockInfo.chain}net`;
                    const ompConfig = { network: chain} as Config;
                    this.omp = new OpenMarketProtocol(ompConfig);
                    this.omp.inject(Cryptocurrency.PART, coreRpcService);
                },
                () => {
                    const ompConfig = { network: 'testnet'} as Config;
                    this.omp = new OpenMarketProtocol(ompConfig);
                    this.omp.inject(Cryptocurrency.PART, coreRpcService);
                }
            );
        });
    }
}
