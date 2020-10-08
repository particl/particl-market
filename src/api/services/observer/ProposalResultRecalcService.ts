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
import { BlacklistService } from '../model/BlacklistService';
import { BlacklistCreateRequest } from '../../requests/model/BlacklistCreateRequest';
import { BlacklistType } from '../../enums/BlacklistType';


export class ProposalResultRecalcService extends BaseObserverService {

    // interval to recalculate ProposalResults in milliseconds
    private recalculationInterval = process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL * 60 * 1000;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
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
        //              - remove listingitems which have been voted off (if possible)
        //              - blacklist the listingitem hash
        //          - if ProposalCategory.MARKET_VOTE
        //              - remove markets which have been voted off (if possible)
        //              - blacklist the market hash

        const activeProposals: resources.Proposal[] = await this.proposalService.search(proposalSearchParams).then(value => value.toJSON());

        for (const proposal of activeProposals) {
            // get the latest ProposalResult for the Proposal to check whether its time to recalculate it (process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL)
            let proposalResult: resources.ProposalResult = await this.proposalResultService.findLatestByProposalHash(proposal.hash)
                .then(async proposalResultModel => proposalResultModel.toJSON())
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });

            // recalculate if there is no ProposalResult yet or if its time to recalculate
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

    /**
     * todo: this does not yet consider different local profiles
     *
     * @param flaggedItemId
     * @param proposalResult
     */
    public async removeIfNeeded(flaggedItemId: number, proposalResult: resources.ProposalResult): Promise<void> {

        if (proposalResult.Proposal.category !== ProposalCategory.PUBLIC_VOTE) {

            // fetch the FlaggedItem and remove if thresholds are hit
            await this.flaggedItemService.findOne(flaggedItemId)
                .then(async value => {
                    const flaggedItem: resources.FlaggedItem = value.toJSON();
                    const shouldRemove = await this.proposalResultService.shouldRemoveFlaggedItem(proposalResult, flaggedItem);

                    if (shouldRemove) {

                        switch (proposalResult.Proposal.category) {
                            case ProposalCategory.ITEM_VOTE:
                                // todo: the actual removal of items related to the blacklist could be a separate task
                                await this.listingItemService.destroy(flaggedItem.ListingItem!.id);

                                const blacklistListingCreateRequest = {
                                    type: BlacklistType.LISTINGITEM,
                                    target: flaggedItem.ListingItem!.hash,
                                    market: flaggedItem.Proposal.market
                                } as BlacklistCreateRequest;

                                return await this.blacklistService.create(blacklistListingCreateRequest).then(bl => bl.toJSON());

                            case ProposalCategory.MARKET_VOTE:
                                await this.marketService.destroy(flaggedItem.Market!.id);

                                const blacklistMarketCreateRequest = {
                                    type: BlacklistType.MARKET,
                                    target: flaggedItem.Proposal.market
                                } as BlacklistCreateRequest;

                                return await this.blacklistService.create(blacklistMarketCreateRequest).then(bl => bl.toJSON());

                            default:
                                break;
                        }
                    }
                })
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });

        }
    }
}
