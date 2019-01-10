// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Bid } from './Bid';


export class LockedOutput extends Bookshelf.Model<LockedOutput> {

    public static RELATIONS = [
        'Bid'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<LockedOutput> {
        if (withRelated) {
            return await LockedOutput.where<LockedOutput>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await LockedOutput.where<LockedOutput>({ id: value }).fetch();
        }
    }

    public static async fetchByTxId(value: string, withRelated: boolean = true): Promise<LockedOutput> {
        if (withRelated) {
            return await LockedOutput.where<LockedOutput>({ txid: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await LockedOutput.where<LockedOutput>({ txid: value }).fetch();
        }
    }

    public get tableName(): string { return 'locked_outputs'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Txid(): string { return this.get('txid'); }
    public set Txid(value: string) { this.set('txid', value); }

    public get Vout(): number { return this.get('vout'); }
    public set Vout(value: number) { this.set('vout', value); }

    public get Amount(): number { return this.get('amount'); }
    public set Amount(value: number) { this.set('amount', value); }

    public get Data(): string { return this.get('data'); }
    public set Data(value: string) { this.set('data', value); }

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get ScriptPubKey(): string { return this.get('scriptPubKey'); }
    public set ScriptPubKey(value: string) { this.set('scriptPubKey', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Bid(): Bid {
        return this.belongsTo(Bid, 'bid_id', 'id');
    }

}
