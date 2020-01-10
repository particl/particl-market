// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { Order } from './Order';
import { Bid } from './Bid';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderSearchOrderField } from '../enums/SearchOrderField';
import { OrderItemSearchParams } from '../requests/search/OrderItemSearchParams';

export class OrderItem extends Bookshelf.Model<OrderItem> {

    public static RELATIONS = [
        'Order',
        'Bid',
        'Bid.BidDatas',
        'Bid.ChildBids',
        'Bid.ListingItem',
        'Bid.ListingItem.ListingItemTemplate',
        'Bid.ListingItem.PaymentInformation',
        'Bid.ListingItem.PaymentInformation.Escrow',
        'Bid.ListingItem.PaymentInformation.Escrow.Ratio',
        'Bid.ShippingAddress'
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

    public static async searchBy(options: OrderItemSearchParams, withRelated: boolean = true): Promise<Collection<OrderItem>> {
        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || OrderSearchOrderField.UPDATED_AT;

        const collection = Order.forge<Model<OrderItem>>()
            .query( qb => {
                if (options.market || options.listingItemId) {
                    qb.join('bids', 'order_items.bid_id', 'bids.id');
                    qb.join('listing_items', 'bid.listing_item_id', 'listing_items.id');

                    if (options.market) {
                        qb.where('listing_items.market', '=', options.market);
                    }
                    if (options.listingItemId) {
                        qb.where('bids.listing_item_id', '=', options.listingItemId);
                    }
                }

                if (options.status && typeof options.status === 'string') {
                    qb.where('order_items.status', '=', options.status);
                }

                if (options.market || options.listingItemId) {
                    qb.join('orders', 'order_times.order_id', 'orders.id');
                    if (options.buyerAddress) {
                        qb.where('orders.buyer', '=', options.buyerAddress);
                    }
                    if (options.sellerAddress) {
                        qb.where('orders.seller', '=', options.sellerAddress);
                    }
                }

            })
            .orderBy('order_items.' + options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });

        if (withRelated) {
            return await collection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await collection.fetchAll();
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
}
