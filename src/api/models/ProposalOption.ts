// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Proposal } from './Proposal';
import {Collection} from 'bookshelf';
import {Vote} from './Vote';


export class ProposalOption extends Bookshelf.Model<ProposalOption> {

    public static RELATIONS = [
        'Proposal',
        'Votes'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ProposalOption> {
        if (withRelated) {
            return await ProposalOption.where<ProposalOption>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalOption.where<ProposalOption>({ id: value }).fetch();
        }
    }

    public static async fetchByProposalAndOptionId(proposalId: number, optionId: number, withRelated: boolean = true): Promise<ProposalOption> {
        if (withRelated) {
            return await ProposalOption.where<ProposalOption>({ proposal_id: proposalId, option_id: optionId }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalOption.where<ProposalOption>({ proposal_id: proposalId, option_id: optionId }).fetch();
        }
    }

    public get tableName(): string { return 'proposal_options'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get OptionId(): number { return this.get('option_id'); }
    public set OptionId(value: number) { this.set('option_id', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Proposal(): Proposal {
        return this.belongsTo(Proposal, 'proposal_id', 'id');
    }

    public Votes(): Collection<Vote> {
        return this.hasMany(Vote, 'proposal_option_id', 'id');
    }

}
