// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Collection, Model } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Address } from './Address';
import { FavoriteItem } from './FavoriteItem';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';
import { Market } from './Market';
import { Identity } from './Identity';
import { Setting } from './Setting';
import { Blacklist } from './Blacklist';
import { Image } from './Image';
import { ListingItemTemplate } from './ListingItemTemplate';


export class Profile extends Bookshelf.Model<Profile> {

    public static RELATIONS = [
        'ShippingAddresses',
        'CryptocurrencyAddresses',
        'FavoriteItems',
        'Markets',
        'Markets.Identity',
        'Identities',
        'Identities.Markets',
        'Settings',
        'Blacklists'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Profile> {
        return Profile.where<Profile>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchByName(value: string, withRelated: boolean = true): Promise<Profile> {
        return Profile.where<Profile>({ name: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'profiles'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

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

    public Markets(): Collection<Market> {
        return this.hasMany(Market, 'profile_id', 'id');
    }

    public Identities(): Collection<Identity> {
        return this.hasMany(Identity, 'profile_id', 'id');
    }

    public Settings(): Collection<Setting> {
        return this.hasMany(Setting, 'profile_id', 'id');
    }

    public ListingItemTemplates(): Collection<ListingItemTemplate> {
        return this.hasMany(ListingItemTemplate, 'profile_id', 'id');
    }

    public Blacklists(): Collection<Blacklist> {
        return this.hasMany(Blacklist, 'profile_id', 'id');
    }

    public Image(): Image {
        return this.belongsTo(Image, 'image_id', 'id');
    }

}
