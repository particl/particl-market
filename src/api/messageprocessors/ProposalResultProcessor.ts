// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Core, Targets, Types } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ProposalService } from '../services/ProposalService';
import { ProposalSearchParams } from '../requests/ProposalSearchParams';
import { ProposalType } from '../enums/ProposalType';
import { ProposalResultService } from '../services/ProposalResultService';
import { ListingItemService } from '../services/ListingItemService';
import {catchClause} from 'babel-types';
import {errorComparator} from 'tslint/lib/verify/lintError';
import {MessageException} from '../exceptions/MessageException';

export class ProposalResultProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 60 * 1000;
    // interval to recalculate ProposalResults in milliseconds (passed by minutes)
    private recalculationInterval = process.env.PROPOSAL_RESULT_RECALCULATION_INTERVAL * 60 * 1000;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService
    ) {
        this.log = new Logger(__filename);
    }


    public async process(): Promise<void> {

        // return Proposals ending after Date.now()
        const proposalSearchParams = {
            // type: ProposalType.ITEM_VOTE,
            timeStart: Date.now(),
            timeEnd: '*'
        } as ProposalSearchParams;

        // - find all currently active proposals
        // - for proposals
        //   - get latest proposalresult
        //   - if enough time has passed since last recalculation -> recalculateProposalResult
        //     - remove listingitems which have been voted off
        await this.proposalService.search(proposalSearchParams)
            .then(async proposalModels => {
                const proposals: resources.Proposal[] = proposalModels.toJSON();

                for (const proposal of proposals) {
                    const proposalResult: resources.ProposalResult = await this.proposalResultService.findLatestByProposalHash(proposal.hash)
                        .catch(reason => {
                            this.log.error('ERROR: ', reason);
                        })
                        .then(async proposalResultModel => {
                            if (proposalResultModel) {
                                return proposalResultModel.toJSON();
                            }
                        });

                    if (proposalResult && proposalResult.calculatedAt + this.recalculationInterval < Date.now()) {
                        this.log.debug('time to recalculate ProposalResult for: ', proposal.hash);

                        await this.proposalService.recalculateProposalResult(proposal);
                        // after recalculating the ProposalResult, if proposal is of type ITEM_VOTE,
                        // we can now check whether the ListingItem should be removed or not
                        if (proposal.type === ProposalType.ITEM_VOTE) {
                            const listingItem: resources.ListingItem = await this.listingItemService.findOneByHash(proposalResult.Proposal.item)
                                .then(value => value.toJSON());
                            await this.proposalResultService.shouldRemoveListingItem(proposalResult, listingItem)
                                .then(async remove => {
                                    if (remove) {
                                        await this.listingItemService.destroy(listingItem.id);
                                    }
                                });
                        }
                    }
                }
            });
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
