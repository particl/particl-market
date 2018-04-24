import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Address } from './Address';
import { FavoriteItem } from './FavoriteItem';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';
import { ShoppingCart } from './ShoppingCart';
export declare class Profile extends Bookshelf.Model<Profile> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<Profile>;
    static fetchByName(value: string, withRelated?: boolean): Promise<Profile>;
    static fetchByAddress(value: string, withRelated?: boolean): Promise<Profile>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Name: string;
    Address: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ShippingAddresses(): Collection<Address>;
    CryptocurrencyAddresses(): Collection<CryptocurrencyAddress>;
    FavoriteItems(): Collection<FavoriteItem>;
    ShoppingCart(): Collection<ShoppingCart>;
}
