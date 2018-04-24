import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
import { ShoppingCartItem } from './ShoppingCartItem';
export declare class ShoppingCart extends Bookshelf.Model<ShoppingCart> {
    static fetchById(value: number, withRelated?: boolean): Promise<ShoppingCart>;
    static fetchAllByProfile(value: number): Promise<Collection<ShoppingCart>>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Name: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    Profile(): Profile;
    ShoppingCartItem(): Collection<ShoppingCartItem>;
}
