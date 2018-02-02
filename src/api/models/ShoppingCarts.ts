import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
import { ShoppingCartItems } from './ShoppingCartItems';

export class ShoppingCarts extends Bookshelf.Model<ShoppingCarts> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ShoppingCarts> {
        if (withRelated) {
            return await ShoppingCarts.where<ShoppingCarts>({ id: value }).fetch({
                withRelated: [
                    'Profile',
                    'ShoppingCartItems'
                ]
            });
        } else {
            return await ShoppingCarts.where<ShoppingCarts>({ id: value }).fetch();
        }
    }

    public static async fetchAllByProfile(value: number | string, withRelated: boolean = true): Promise<Collection<ShoppingCarts>> {
        const shoppingCarts = ShoppingCarts.forge<Collection<ShoppingCarts>>()
            .query(qb => {
                if (typeof value === 'number') {
                    // for profileID
                    qb.where('profile_id', '=', value);
                } else {
                    // for profileName
                    qb.where('profiles.name', '=', value);
                    qb.innerJoin('profiles', 'profiles.id', 'shopping_carts.profile_id');
                }
            }).orderBy('id', 'ASC');

        if (withRelated) {
            return await shoppingCarts.fetchAll({
                withRelated: [
                    'Profile',
                    'ShoppingCartItems'
                ]
            });
        } else {
            return await shoppingCarts.fetchAll();
        }

    }

    public get tableName(): string { return 'shopping_carts'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

    public ShoppingCartItems(): Collection<ShoppingCartItems> {
        return this.hasMany(ShoppingCartItems, 'shopping_cart_id', 'id');
    }
}
