import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Order } from './Order';
import { Bid } from './Bid';
import { OrderItemObject } from './OrderItemObject';

export class OrderItem extends Bookshelf.Model<OrderItem> {

    public static RELATIONS = [
        'Order',
        'Bid',
        'Bid.ListingItem',
        'Bid.ListingItem.ListingItemTemplate',
        'Bid.ListingItem.PaymentInformation',
        'Bid.ListingItem.PaymentInformation.Escrow',
        'Bid.ListingItem.PaymentInformation.Escrow.Ratio',
        'Bid.ShippingAddress',
        'OrderItemObjects'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<OrderItem> {
        if (withRelated) {
            return await OrderItem.where<OrderItem>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await OrderItem.where<OrderItem>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'order_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Status(): string { return this.get('status'); }
    public set Status(value: string) { this.set('status', value); }

    public get ItemHash(): string { return this.get('item_hash'); }
    public set ItemHash(value: string) { this.set('item_hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Order(): Order {
        return this.belongsTo(Order, 'order_id', 'id');
    }

    public Bid(): Bid {
        return this.belongsTo(Bid, 'bid_id', 'id');
    }

    // public ListingItem(): ListingItem {
    //    return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    // }

    public OrderItemObjects(): Collection<OrderItemObject> {
        return this.hasMany(OrderItemObject, 'order_item_id', 'id');
    }

}
