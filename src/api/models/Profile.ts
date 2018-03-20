import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Address } from './Address';
import { FavoriteItem } from './FavoriteItem';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';
import { ShoppingCart } from './ShoppingCart';

export class Profile extends Bookshelf.Model<Profile> {

    public static RELATIONS = [
        'ShippingAddresses',
        'CryptocurrencyAddresses',
        'FavoriteItems',
        'ShoppingCart'
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

    public static async fetchByName(value: string = '', withRelated: boolean = true): Promise<Profile> {
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

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ShippingAddresses(): Collection<Address> {
        return this.hasMany(Address, 'profile_id', 'id');
    }

    public CryptocurrencyAddresses(): Collection<CryptocurrencyAddress> {
        return this.hasMany(CryptocurrencyAddress, 'profile_id', 'id');
    }

    public FavoriteItems(): Collection<FavoriteItem> {
        return this.hasMany(FavoriteItem, 'profile_id', 'id');
    }

    public ShoppingCart(): Collection<ShoppingCart> {
        return this.hasMany(ShoppingCart, 'profile_id', 'id');
    }
}
