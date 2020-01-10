// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Core, Targets, Types } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ProposalService } from '../services/model/ProposalService';
import { ProposalSearchParams } from '../requests/search/ProposalSearchParams';
import { ProposalCategory } from '../enums/ProposalCategory';
import { ProposalResultService } from '../services/model/ProposalResultService';
import { ListingItemService } from '../services/model/ListingItemService';
import { MarketService } from '../services/model/MarketService';
import { FlaggedItemService } from '../services/model/FlaggedItemService';

// TODO: this should be refactored, this is not a MessageProcessor!

export class ProposalResultProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 60 * 1000;
    // interval to recalculate ProposalResults in milliseconds (passed by minutes)
    private recalculationInterval = process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL * 60 * 1000;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalResultService) public proposalResultService: ProposalResultService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Periodically recalculate the active Proposals ProposalResults
     */
    public async process(): Promise<void> {

        // this.log.debug('process(), recalculate ProposalResults...');

        // return Proposals ending after Date.now()
        const proposalSearchParams = {
            timeStart: Date.now(),
            timeEnd: '*'
        } as ProposalSearchParams;

        //  - find all currently active Proposals
        //  - for each Proposal
        //      - get its latest ProposalResult
        //      - if enough time has passed since last recalculation -> call recalculateProposalResult
        //          - if ProposalCategory.ITEM_VOTE
        //              - remove listingitems which have been voted off
        //              - TODO: blacklist
        //          - TODO: if ProposalCategory.MARKET_VOTE
        //              - TODO: remove markets which have been voted off
        //              - TODO: blacklist
        //

        const activeProposals: resources.Proposal[] = await this.proposalService.search(proposalSearchParams).then(value => value.toJSON());

        for (const proposal of activeProposals) {
            // get the latest ProposalResult for the Proposal to check whether its time to recalculate it (process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL)
            let proposalResult: resources.ProposalResult = await this.proposalResultService.findLatestByProposalHash(proposal.hash)
                .then(async proposalResultModel => proposalResultModel.toJSON())
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });

            // recalculate if there is no ProposalResult yet or its time to recalculate
            if (!proposalResult || (proposalResult && proposalResult.calculatedAt + this.recalculationInterval < Date.now())) {

                proposalResult = await this.proposalService.recalculateProposalResult(proposal);
                await this.flaggedItemService.removeIfNeeded(proposal.FlaggedItem.id, proposalResult);

            } else {
                this.log.debug('process(), skip proposal.hash: ', proposal.hash);
                this.log.debug('process(), proposalResult.calculatedAt: ', proposalResult.calculatedAt);
            }
        } // for

    }

    public scheduleProcess(): void {
        this.timeout = setTimeout(
            async () => {
                await this.process();
                this.scheduleProcess();
            },
            this.interval
        );
    }
}
