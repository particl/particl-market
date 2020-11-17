// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
import { BlacklistSearchParams } from '../../requests/search/BlacklistSearchParams';


export class ProposalResultRecalcService extends BaseObserverService {

    // interval to recalculate ProposalResults in milliseconds
    private recalculationWaitInterval = process.env.PROPOSAL_RESULT_RECALCULATION_WAIT_INTERVAL * 60 * 1000;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalResultService) public proposalResultService: ProposalResultService
    ) {
        // run every minute
        super(__filename, process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL * 60 * 1000, Logger);
    }

    /**
     * Periodically recalculate the active Proposals ProposalResults
     */
    public async run(currentStatus: ObserverStatus): Promise<ObserverStatus> {

        //  - find all currently active Proposals
        //  - for each active Proposal
        //      - get its latest ProposalResult
        //      - if enough time has passed since last recalculation -> call recalculateProposalResult
        //
        //  - find all expired Proposals have no FinalProposalResult set
        //  - for each expired Proposal
        //       - calculate final ProposalResult
        //          - add blacklists if needed
        //
        //  - remove all items matching with blacklists

        const activeProposals: resources.Proposal[] = await this.proposalService.search({
            // return Proposals ending after timeStart
            timeStart: Date.now()
        } as ProposalSearchParams).then(value => value.toJSON());

        for (const proposal of activeProposals) {
            // get the latest ProposalResult for the Proposal to check whether its time to recalculate it (process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL)
            let proposalResult: resources.ProposalResult = await this.proposalResultService.findLatestByProposalHash(proposal.hash)
                .then(async proposalResultModel => proposalResultModel.toJSON())
                .catch(reason => {
                    this.log.warn('ERROR: ', reason);
                    this.log.debug('Did not find a ProposalResult, it will be calculed.');
                });

            // recalculate if there is no ProposalResult yet or if its time to recalculate
            if (!proposalResult || (proposalResult && (proposalResult.calculatedAt + this.recalculationWaitInterval) < Date.now())) {
                proposalResult = await this.proposalService.recalculateProposalResult(proposal);
            }
        }

        const expiredProposals: resources.Proposal[] = await this.proposalService.search({
            // return Proposals ending before timeEnd, having no FinalProposalResult set
            timeEnd: Date.now(),
            hasFinalResult: false
        } as ProposalSearchParams).then(value => value.toJSON());

        const newBlacklists: resources.Blacklist[] = [];
        for (const proposal of expiredProposals) {
            // calculate the final ProposalResult
            const proposalResult = await this.proposalService.recalculateProposalResult(proposal);
            await this.proposalService.setFinalProposalResult(proposal.id, proposalResult.id);

            for (const flaggedItem of proposal.FlaggedItems) {
                const blacklist = await this.addBlacklistAndRemoveFlagged(flaggedItem.id, proposalResult);
                if (blacklist) {
                    newBlacklists.push(blacklist);
                }
            }
        }

        this.log.debug('process(), activeProposals: ' + activeProposals.length + ', expiredProposals: ' + expiredProposals.length
            + ', newBlacklists: ' + newBlacklists.length);

        return ObserverStatus.RUNNING;
    }

    /**
     *
     * @param flaggedItemId
     * @param proposalResult
     */
    public async addBlacklistAndRemoveFlagged(flaggedItemId: number, proposalResult: resources.ProposalResult): Promise<resources.Blacklist | undefined> {

        let blacklist: resources.Blacklist | undefined;

        if (proposalResult.Proposal.category !== ProposalCategory.PUBLIC_VOTE) {

            blacklist = await this.flaggedItemService.findOne(flaggedItemId, true)
                .then(async valueFlagged => {
                    const flaggedItem: resources.FlaggedItem = valueFlagged.toJSON();
                    const shouldRemove = await this.proposalResultService.shouldRemoveFlaggedItem(proposalResult, flaggedItem);

                    if (shouldRemove) {

                        // check if blacklist exists
                        const type = ProposalCategory.ITEM_VOTE
                            ? BlacklistType.LISTINGITEM
                            : ProposalCategory.MARKET_VOTE
                                ? BlacklistType.MARKET
                                : undefined;
                        const target = flaggedItem.Proposal.target;
                        const market = flaggedItem.Proposal.market;

                        const found: resources.Blacklist[] = await this.blacklistService.search({
                            type,
                            targets: [target],
                            market
                        } as BlacklistSearchParams).then(valueBL => valueBL.toJSON());

                        if (found.length === 0) {
                            // nothing found -> create
                            blacklist = await this.blacklistService.create({
                                type,
                                target,
                                market
                            } as BlacklistCreateRequest).then(bl => bl.toJSON());
                        }

                        // remove flagged items
                        await this.flaggedItemService.destroy(flaggedItem.id);
                        if (!_.isNil(flaggedItem.ListingItem)) {
                            await this.listingItemService.destroy(flaggedItem.ListingItem.id);
                        }
                        if (!_.isNil(flaggedItem.Market)) {
                            await this.marketService.destroy(flaggedItem.Market.id);
                        }
                    }
                    return blacklist;

                })
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                    return undefined;
                });
        }

        return undefined;
    }
}
