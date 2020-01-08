// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Address } from './Address';
import { FavoriteItem } from './FavoriteItem';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';
import { ShoppingCart } from './ShoppingCart';
import { Market } from './Market';
import { Identity } from './Identity';

export class Profile extends Bookshelf.Model<Profile> {

    public static RELATIONS = [
        'ShippingAddresses',
        'CryptocurrencyAddresses',
        'FavoriteItems',
        'ShoppingCart',
        'Markets',
        'Markets.Identity',
        'Identities',
        'Identities.Markets'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Profile> {
        if (withRelated) {
            return await Profile.where<Profile>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Profile.where<Profile>({ id: value }).fetch();
        }
    }

    public static async fetchByName(value: string, withRelated: boolean = true): Promise<Profile> {
        if (withRelated) {
            return await Profile.where<Profile>({ name: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Profile.where<Profile>({ name: value }).fetch();
        }
    }

    public get tableName(): string { return 'profiles'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    // Deprecated, use the Profiles Identity.address
    // public get Address(): string { return this.get('address'); }
    // public set Address(value: string) { this.set('address', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public ShippingAddresses(): Collection<Address> {
        return this.hasMany(Address, 'profile_id', 'id');
    }

    public CryptocurrencyAddresses(): Collection<CryptocurrencyAddress> {
        return this.hasMany(CryptocurrencyAddress, 'profile_id', 'id');
    }

    public FavoriteItems(): Collection<FavoriteItem> {
        return this.hasMany(FavoriteItem, 'profile_id', 'id');
    }

    // TODO: rename to ShoppingCarts
    public ShoppingCart(): Collection<ShoppingCart> {
        return this.hasMany(ShoppingCart, 'profile_id', 'id');
    }

    public Markets(): Collection<Market> {
        return this.hasMany(Market, 'profile_id', 'id');
    }

    public Identities(): Collection<Identity> {
        return this.hasMany(Identity, 'profile_id', 'id');
    }

}
