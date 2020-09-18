// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { Proposal } from './Proposal';
import { ProposalOptionResult } from './ProposalOptionResult';
import { SearchOrder } from '../enums/SearchOrder';
import { Logger as LoggerType } from '../../core/Logger';

export class ProposalResult extends Bookshelf.Model<ProposalResult> {

    public static log: LoggerType = new LoggerType(__filename);

    public static RELATIONS = [
        'Proposal',
        'Proposal.FlaggedItem',
        'ProposalOptionResults',
        'ProposalOptionResults.ProposalOption'
        // 'ProposalOptionResults.ProposalOption.Votes'
    ];

    public static async fetchAllByProposalHash(hash: string, withRelated: boolean = true): Promise<Collection<ProposalResult>> {

        this.log.debug('hash: ', hash);

        const proposalResultCollection = ProposalResult.forge<Model<ProposalResult>>()
            .query(qb => {
                qb.join('proposals', 'proposal_results.proposal_id', 'proposals.id');
                qb.where('proposals.hash', '=', hash);
            })
            .orderBy('id', SearchOrder.DESC);

        return proposalResultCollection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ProposalResult> {
        return ProposalResult.where<ProposalResult>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'proposal_results'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get CalculatedAt(): number { return this.get('calculatedAt'); }
    public set CalculatedAt(value: number) { this.set('calculatedAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Proposal(): Proposal {
        return this.belongsTo(Proposal, 'proposal_id', 'id');
    }

    public ProposalOptionResults(): Collection<ProposalOptionResult> {
        return this.hasMany(ProposalOptionResult, 'proposal_result_id', 'id');
    }

}
