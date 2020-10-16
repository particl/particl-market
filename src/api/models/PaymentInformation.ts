// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Escrow } from './Escrow';
import { ItemPrice } from './ItemPrice';


export class PaymentInformation extends Bookshelf.Model<PaymentInformation> {

    public static RELATIONS = [
        'Escrow',
        'Escrow.Ratio',
        'ItemPrice',
        'ItemPrice.ShippingPrice',
        'ItemPrice.CryptocurrencyAddress'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<PaymentInformation> {
        return PaymentInformation.where<PaymentInformation>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'payment_informations'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Escrow(): Escrow {
        return this.hasOne(Escrow);
    }

    public ItemPrice(): ItemPrice {
        return this.hasOne(ItemPrice);
    }

}
