// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseObserverService } from './BaseObserverService';
import { ObserverStatus } from '../../enums/ObserverStatus';
import { ProposalService } from '../model/ProposalService';

export class ExpiredProposalService extends BaseObserverService {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) private proposalService: ProposalService
    ) {
        // TODO: process.env.PROPOSALS_EXPIRED_INTERVAL
        super(__filename, 10 * 60 * 1000, Logger);
    }

    /**
     * Find expired Proposals and remove them...
     *
     * @param currentStatus
     */
    public async run(currentStatus: ObserverStatus): Promise<ObserverStatus> {

        const proposals: resources.Proposal[] = await this.proposalService.findAllExpired().then(value => value.toJSON());

        for (const proposal of proposals) {
            // we got all the expired, but we don't want to really remove them all right away
            // todo: modify the search query and return only the 30 days old ones
            if (proposal.expiredAt <= Date.now() + 30 * 24 * 60 * 60 * 1000) {
                await this.proposalService.destroy(proposal.id)
                    .catch(reason => {
                        this.log.error('Failed to remove expired Proposal (' + proposal.hash + ') on Market (' + proposal.market + '): ', reason);
                    });
            }
        }

        return ObserverStatus.RUNNING;
    }

}
