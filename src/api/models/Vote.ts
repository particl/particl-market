// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import {ProposalOption} from './ProposalOption';

export class Vote extends Bookshelf.Model<Vote> {

    public static RELATIONS = [
        'ProposalOption',
        'ProposalOption.Proposal',
        'ProposalOption.Proposal.FlaggedItem',
        'ProposalOption.Proposal.FlaggedItem.ListingItem'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Vote> {
        if (withRelated) {
            return await Vote.where<Vote>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Vote.where<Vote>({ id: value }).fetch();
        }
    }


    public static async fetchByVoterAndProposalId(voter: string, proposalId: number, withRelated: boolean = true): Promise<Vote> {
        if (withRelated) {
            const vote = Vote.forge<Vote>()
            .query(qb => {
                qb.innerJoin('proposal_options', 'proposal_options.id', 'votes.proposal_option_id');
                qb.where('proposal_options.proposal_id', '=', proposalId);
                qb.andWhere('voter', '=', voter);
            });
            return await vote.fetch({
                withRelated: this.RELATIONS
            });
        } else {
            const vote = Vote.forge<Vote>()
            .query(qb => {
                qb.innerJoin('proposal_options', 'proposal_options.id', 'votes.proposal_option_id');
                qb.where('proposal_options.proposal_id', '=', proposalId);
                qb.andWhere('voter', '=', voter);
            });
            return await vote.fetch();
        }
    }

    public get tableName(): string { return 'votes'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Voter(): string { return this.get('voter'); }
    public set Voter(value: string) { this.set('voter', value); }

    public get Weight(): number { return this.get('weight'); }
    public set Weight(value: number) { this.set('weight', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ProposalOption(): ProposalOption {
        return this.belongsTo(ProposalOption, 'proposal_option_id', 'id');
    }
}
