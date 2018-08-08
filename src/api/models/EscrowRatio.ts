// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';


export class EscrowRatio extends Bookshelf.Model<EscrowRatio> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<EscrowRatio> {
        if (withRelated) {
            return await EscrowRatio.where<EscrowRatio>({ id: value }).fetch({
                withRelated: []
            });
        } else {
            return await EscrowRatio.where<EscrowRatio>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'escrow_ratios'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Buyer(): number { return this.get('buyer'); }
    public set Buyer(value: number) { this.set('buyer', value); }

    public get Seller(): number { return this.get('seller'); }
    public set Seller(value: number) { this.set('seller', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
