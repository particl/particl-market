// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { Proposal } from './Proposal';
import { ProposalOptionResult } from './ProposalOptionResult';
import {SearchOrder} from '../enums/SearchOrder';

export class ProposalResult extends Bookshelf.Model<ProposalResult> {

    public static RELATIONS = [
        'Proposal',
        'ProposalOptionResults',
        'ProposalOptionResults.ProposalOption'
        // 'ProposalOptionResults.ProposalOption.Votes'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ProposalResult> {
        if (withRelated) {
            return await ProposalResult.where<ProposalResult>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalResult.where<ProposalResult>({ id: value }).fetch();
        }
    }

    public static async fetchByProposalHash(hash: string, withRelated: boolean = true): Promise<Collection<ProposalResult>> {
        const proposalResultCollection = ProposalResult.forge<Model<ProposalResult>>()
            .query(qb => {
                qb.join('proposals', 'proposal_results.proposal_id', 'proposals.id');
                qb.where('proposals.hash', '=', hash);
            })
            .orderBy('id', SearchOrder.DESC);


        if (withRelated) {
            return await proposalResultCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await proposalResultCollection.fetchAll();
        }
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
