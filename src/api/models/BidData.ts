// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';


export class BidData extends Bookshelf.Model<BidData> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<BidData> {
        if (withRelated) {
            return await BidData.where<BidData>({ id: value }).fetch({
                withRelated: []
            });
        } else {
            return await BidData.where<BidData>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'bid_datas'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get DataValue(): string { return this.get('data_value'); }
    public set DataValue(value: string) { this.set('data_value', value); }

    public get DataId(): string { return this.get('data_id'); }
    public set DataId(value: string) { this.set('data_id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
