// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ProposalService } from '../model/ProposalService';
import { ProposalSearchParams } from '../../requests/search/ProposalSearchParams';
import { ProposalResultService } from '../model/ProposalResultService';
import { ListingItemService } from '../model/ListingItemService';
import { MarketService } from '../model/MarketService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { BaseObserverService } from './BaseObserverService';
import { ObserverStatus } from '../../enums/ObserverStatus';
import { ProposalCategory } from '../../enums/ProposalCategory';

export class ProposalResultRecalcService extends BaseObserverService {

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
        super(__filename, 60 * 1000, Logger);
    }

    /**
     * Periodically recalculate the active Proposals ProposalResults
     */
    public async run(currentStatus: ObserverStatus): Promise<ObserverStatus> {

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
                await this.removeIfNeeded(proposal.FlaggedItem.id, proposalResult);

            } else {
                this.log.debug('process(), skip proposal.hash: ', proposal.hash);
                this.log.debug('process(), proposalResult.calculatedAt: ', proposalResult.calculatedAt);
            }
        } // for

        return ObserverStatus.RUNNING;
    }

    public async removeIfNeeded(id: number, proposalResult: resources.ProposalResult, flagOnly: boolean = false): Promise<void> {

        // fetch the FlaggedItem and remove if thresholds are hit
        if (proposalResult.Proposal.category !== ProposalCategory.PUBLIC_VOTE) {
            const flaggedItem: resources.FlaggedItem = await this.flaggedItemService.findOne(id)
                .then(value => value.toJSON())
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });

            if (flaggedItem) {
                const shouldRemove = await this.proposalResultService.shouldRemoveFlaggedItem(proposalResult, flaggedItem);
                if (shouldRemove) {
                    switch (proposalResult.Proposal.category) {
                        case ProposalCategory.ITEM_VOTE:
                            await this.listingItemService.destroy(flaggedItem.ListingItem!.id);
                            // TODO: Blacklist
                            break;
                        case ProposalCategory.MARKET_VOTE:
                            await this.marketService.destroy(flaggedItem.Market!.id);
                            // TODO: Blacklist
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
}
