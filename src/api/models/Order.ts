// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { OrderItem } from './OrderItem';
import { Address } from './Address';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderSearchParams } from '../requests/search/OrderSearchParams';
import { OrderSearchOrderField } from '../enums/SearchOrderField';

export class Order extends Bookshelf.Model<Order> {

    public static RELATIONS = [
        'OrderItems',
        'OrderItems.Bid',
        'OrderItems.Bid.BidDatas',
        'OrderItems.Bid.ChildBids',
        'OrderItems.Bid.ChildBids.BidDatas',
        'OrderItems.Bid.ListingItem',
        'OrderItems.Bid.ListingItem.ListingItemTemplate',
        'OrderItems.Bid.ListingItem.PaymentInformation',
        'OrderItems.Bid.ListingItem.PaymentInformation.Escrow',
        'OrderItems.Bid.ListingItem.PaymentInformation.Escrow.Ratio',
        'OrderItems.Bid.ShippingAddress',
        'ShippingAddress',
        'ShippingAddress.Profile'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Order> {
        if (withRelated) {
            return await Order.where<Order>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Order.where<Order>({ id: value }).fetch();
        }
    }

    public static async searchBy(options: OrderSearchParams, withRelated: boolean = true): Promise<Collection<Order>> {
        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || OrderSearchOrderField.UPDATED_AT;

        const orderCollection = Order.forge<Model<Order>>()
            .query( qb => {
                qb.innerJoin('order_items', 'orders.id', 'order_items.order_id');

                if (options.market || options.listingItemId) {
                    qb.innerJoin('bids', 'order_items.bid_id', 'bids.id');

                    if (options.market) {
                        qb.innerJoin('listing_items', 'bid.listing_item_id', 'listing_items.id');
                        qb.andWhere( qbInner => {
                            return qbInner.where('bids.listing_items.market', '=', options.market);
                        });
                    }

                    if (options.listingItemId) {
                        qb.andWhere( qbInner => {
                            return qbInner.where('bids.listing_item_id', '=', options.listingItemId);
                        });
                    }
                }

                if (options.status && typeof options.status === 'string') {
                    qb.andWhere( qbInner => {
                        return qbInner
                            .where('order_items.status', '=', options.status)
                            .orWhere('orders.status', '=', options.status);
                    });
                }

                if (options.buyerAddress) {
                    qb.where('orders.buyer', '=', options.buyerAddress);
                }

                if (options.sellerAddress) {
                    qb.where('orders.seller', '=', options.sellerAddress);
                }
            })
            .orderBy('orders.' + options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
                // debug: true
            });

        if (withRelated) {
            return await orderCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await orderCollection.fetchAll();
        }
    }

    public get tableName(): string { return 'orders'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Status(): string { return this.get('status'); }
    public set Status(value: string) { this.set('status', value); }

    public get Buyer(): string { return this.get('buyer'); }
    public set Buyer(value: string) { this.set('buyer', value); }

    public get Seller(): string { return this.get('seller'); }
    public set Seller(value: string) { this.set('seller', value); }

    public get GeneratedAt(): number { return this.get('generatedAt'); }
    public set GeneratedAt(value: number) { this.set('generatedAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public OrderItems(): Collection<OrderItem> {
        return this.hasMany(OrderItem, 'order_id', 'id');
    }

    public ShippingAddress(): Address {
        return this.belongsTo(Address, 'address_id', 'id');
    }

}
