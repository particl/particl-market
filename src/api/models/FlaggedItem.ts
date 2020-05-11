// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { ListingItem } from './ListingItem';
import { Proposal } from './Proposal';

export class FlaggedItem extends Bookshelf.Model<FlaggedItem> {

    public static RELATIONS = [
        'ListingItem',
        'Proposal'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<FlaggedItem> {
        if (withRelated) {
            return await FlaggedItem.where<FlaggedItem>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await FlaggedItem.where<FlaggedItem>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'flagged_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Reason(): string { return this.get('reason'); }
    public set Reason(value: string) { this.set('reason', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

    public Proposal(): Proposal {
        return this.belongsTo(Proposal, 'proposal_id', 'id');
    }

}
