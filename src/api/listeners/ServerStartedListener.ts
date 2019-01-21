// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { DefaultMarketService } from '../services/DefaultMarketService';
import { EventEmitter } from '../../core/api/events';
import { MessageProcessor} from '../messageprocessors/MessageProcessor';
import { CoreRpcService } from '../services/CoreRpcService';
import { ExpiredListingItemProcessor } from '../messageprocessors/ExpiredListingItemProcessor';
import { SmsgMessageProcessor } from '../messageprocessors/SmsgMessageProcessor';
import { ListingItemActionService } from '../services/ListingItemActionService';
import { BidActionService } from '../services/BidActionService';
import { EscrowActionService } from '../services/EscrowActionService';
import { ProposalActionService } from '../services/ProposalActionService';
import { VoteActionService } from '../services/VoteActionService';
import { ProposalResultProcessor } from '../messageprocessors/ProposalResultProcessor';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');
    public static ServerReadyEvent = Symbol('ServerReadyListenerEvent');

    public log: LoggerType;
    public isAppReady = false;
    public isStarted = false;
    private previousState = false;

    private timeout: any;
    private interval = 1000;

// tslint:disable:max-line-length
    constructor(
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.MessageProcessor) public messageProcessor: MessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.SmsgMessageProcessor) public smsgMessageProcessor: SmsgMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.ExpiredListingItemProcessor) public expiredListingItemProcessor: ExpiredListingItemProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.ProposalResultProcessor) public proposalResultProcessor: ProposalResultProcessor,
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) public bidActionService: BidActionService,
        @inject(Types.Service) @named(Targets.Service.EscrowActionService) public escrowActionService: EscrowActionService,
        @inject(Types.Service) @named(Targets.Service.ProposalActionService) public proposalActionService: ProposalActionService,
        @inject(Types.Service) @named(Targets.Service.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        // ActionServices need to be injected here to start the event listeners when testing

        this.log = new Logger(__filename);
    }
// tslint:enable:max-line-length

    /**
     *
     * @param payload
     * @returns {Promise<void>}
     */
    public async act(payload: any): Promise<any> {
        this.log.info('Received event ServerStartedListenerEvent', payload);
        this.isAppReady = true;
        this.pollForConnection();
    }

    public pollForConnection(): void {
        this.timeout = setTimeout(
            async () => {
                this.isStarted = await this.checkConnection();
                this.pollForConnection();
            },
            this.interval
        );
    }

    public stop(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    private async checkConnection(): Promise<boolean> {
        const isConnected = await this.coreRpcService.isConnected();
        if (isConnected) {

            if (this.previousState !== isConnected) {
                this.log.info('connection with particld established.');

                // seed the default market
                await this.defaultMarketService.seedDefaultMarket();

                // seed the default categories
                await this.defaultItemCategoryService.seedDefaultCategories();

                // seed the default Profile
                await this.defaultProfileService.seedDefaultProfile();

                // start expiredListingItemProcessor
                this.expiredListingItemProcessor.scheduleProcess();
                this.proposalResultProcessor.scheduleProcess();

                // start message polling, unless we're running tests
                this.smsgMessageProcessor.schedulePoll();
                this.messageProcessor.schedulePoll();
                this.interval = 10000;
            }

            // this.log.info('connected to particld, checking again in ' + this.interval + 'ms.');
        } else {

            if (this.previousState !== isConnected) {
                this.log.info('connection with particld disconnected.');

                // stop message polling
                this.messageProcessor.stop();
                this.interval = 1000;
            }

            if (process.env.NODE_ENV !== 'test') {
                this.log.error('failed to connect to particld, retrying in ' + this.interval + 'ms.');
            }
        }

        this.previousState = isConnected;

        return isConnected;
    }


}
