import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { ShoppingCarts } from './ShoppingCarts';
import { ListingItem } from './ListingItem';


export class ShoppingCartItems extends Bookshelf.Model<ShoppingCartItems> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ShoppingCartItems> {
        if (withRelated) {
            return await ShoppingCartItems.where<ShoppingCartItems>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ShoppingCartItemsRelated',
                    // 'ShoppingCartItemsRelated.Related'
                ]
            });
        } else {
            return await ShoppingCartItems.where<ShoppingCartItems>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'shopping_cart_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ShoppingCarts(): ShoppingCarts {
        return this.belongsTo(ShoppingCarts, 'shopping_cart_id', 'id');
    }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }
}
