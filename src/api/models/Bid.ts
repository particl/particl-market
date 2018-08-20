// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import * as _ from 'lodash';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';
import { BidSearchParams } from '../requests/BidSearchParams';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';
import { Address } from './Address';
import { OrderItem } from './OrderItem';
import {OrderStatus} from '../enums/OrderStatus';
import {Logger} from '../../core/Logger';

export class Bid extends Bookshelf.Model<Bid> {

    public static RELATIONS = [
        'BidDatas',
        'ShippingAddress',
        'ShippingAddress.Profile',
        'ListingItem',
        'ListingItem.ListingItemTemplate',
        'OrderItem',
        'OrderItem.OrderItemObjects',
        'OrderItem.Order'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Bid> {
        if (withRelated) {
            return await Bid.where<Bid>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Bid.where<Bid>({ id: value }).fetch();
        }
    }

    public static async search(options: BidSearchParams, withRelated: boolean = true): Promise<Collection<Bid>> {

        const log = new Logger(__filename);
        options.ordering = options.ordering ? options.ordering : SearchOrder.ASC;
        options.page = options.page ? options.page : 0;
        options.pageLimit = options.pageLimit ? options.pageLimit : 10;

        log.debug('options:', JSON.stringify(options, null, 2));

        const bidCollection = Bid.forge<Model<Bid>>()
            .query( qb => {
/*
            .query( qb => {
                    qb.join('order_items', 'orders.id', 'order_items.order_id');
                    if (options.listingItemId) {
                        qb.join('bids', 'order_items.bid_id', 'bids.id');
                        qb.where('bids.listing_item_id', '=', options.listingItemId);
                    }

                    if (options.status && typeof options.status === 'string') {
                        qb.where('order_items.status', '=', options.status);
                    }

                    if (options.buyerAddress && typeof options.buyerAddress === 'string') {
                        qb.where('orders.buyer', '=', options.buyerAddress);
                    }

                    if (options.sellerAddress && typeof options.sellerAddress === 'string') {
                        qb.where('orders.seller', '=', options.sellerAddress);
                    }
                }).orderBy('orders.created_at', options.ordering);
*/

                if (options.listingItemId) {
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }

                if (options.status
                    && (options.status === BidMessageType.MPA_ACCEPT
                        || options.status === BidMessageType.MPA_BID
                        || options.status === BidMessageType.MPA_CANCEL
                        || options.status === BidMessageType.MPA_REJECT)) {
                    qb.where('bids.action', '=', options.status);
                }

                if (options.status
                    && (options.status === OrderStatus.AWAITING_ESCROW
                        || options.status === OrderStatus.COMPLETE
                        || options.status === OrderStatus.ESCROW_LOCKED
                        || options.status === OrderStatus.SHIPPING)) {
                    qb.innerJoin('order_items', 'order_items.bid_id', 'bids.id');
                    qb.where('order_items.status', '=', options.status);
                }

                if (options.searchString) {
                    qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'bids.listing_item_id');
                    qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%')
                        .orWhere('item_informations.short_description', 'LIKE', '%' + options.searchString + '%')
                        .orWhere('item_informations.long_description', 'LIKE', '%' + options.searchString + '%');
                }

                if (!_.isEmpty(options.bidders)) {
                    qb.whereIn('bids.bidder', options.bidders);
                }

/*
                if (options.listingItemId) {
                   qb.where('bids.listing_item_id', '=', options.listingItemId);
                }

                if (options.status
                    && (options.status === BidMessageType.MPA_ACCEPT
                        || options.status === BidMessageType.MPA_BID
                        || options.status === BidMessageType.MPA_CANCEL
                        || options.status === BidMessageType.MPA_REJECT)) {
                    qb.where('bids.action', '=', options.status);
                }

                if (options.status
                    && (options.status === OrderStatus.AWAITING_ESCROW
                        || options.status === OrderStatus.COMPLETE
                        || options.status === OrderStatus.ESCROW_LOCKED
                        || options.status === OrderStatus.SHIPPING)) {
                    qb.innerJoin('order_items', 'order_items.bid_id', 'bids.id');
                    qb.where('order_items.status', '=', options.status);
                }

                if (options.searchString) {
                    qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'bids.listing_item_id');
                    qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                    qb.orWhere('item_informations.short_description', 'LIKE', '%' + options.searchString + '%');
                    qb.orWhere('item_informations.long_description', 'LIKE', '%' + options.searchString + '%');
                }
                if (!_.isEmpty(options.bidders)) {
                    qb.whereIn('bids.bidder', options.bidders);
                }
*/
            })
            .orderBy('bids.updated_at', options.ordering)
            .query({
                limit: options.pageLimit,
                offset: (options.page - 1) * options.pageLimit
            });

        if (withRelated) {
            return await bidCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await bidCollection.fetchAll();
        }
    }
/*
 console.log node_modules/knex/lib/helpers.js:75
    { method: 'select',
      options: {},
      timeout: false,
      cancelOnTimeout: false,
      bindings: [ 27, 0 ],
      __knexQueryUid: '3c0d7d66-6f94-4f99-bc51-d8d8ddac6afb',
      sql: 'select "bids".* from "bids" inner join "order_items" on "order_items"."bid_id" = "bids"."id"
       inner join "item_informations" on "item_informations"."listing_item_id" = "bids"."listing_item_id"
        where "bids"."listing_item_id" = ? order by "bids"."updated_at" ASC limit ?' }

  console.log node_modules/knex/lib/helpers.js:75
    { method: 'select',
      options: {},
      timeout: false,
      cancelOnTimeout: false,
      bindings: [ 27, 'pacMrSKhcNvp4xaMD7ht1pduFuCYHmpWtS', 0 ],
      __knexQueryUid: '0e69404a-5ce5-4577-a393-1bbd4c684b7c',
      sql: 'select "bids".* from "bids" inner join "order_items" on "order_items"."bid_id" = "bids"."id"
       inner join "item_informations" on "item_informations"."listing_item_id" = "bids"."listing_item_id"
        where "bids"."listing_item_id" = ? and ("bids"."bidder" in (?)) order by "bids"."updated_at" ASC limit ?' }

  console.log node_modules/knex/lib/helpers.js:75
    { method: 'select',
      options: {},
      timeout: false,
      cancelOnTimeout: false,
      bindings:
       [ '88257c6f9f920d5a655989a3e348e31168b59eab0fd26cc0771b79faf16e70e5',
         1 ],
      __knexQueryUid: 'aa6deaab-702b-44b2-83c2-674fc294b2f2',
      sql: 'select "listing_items".* from "listing_items" where "hash" = ? limit ?' }

  console.log node_modules/knex/lib/helpers.js:75
    { method: 'select',
      options: {},
      timeout: false,
      cancelOnTimeout: false,
      bindings: [ 27, 0 ],
      __knexQueryUid: 'f4d10fb4-de2e-467d-a089-66801c7da402',
      sql: 'select "bids".* from "bids" inner join "order_items" on "order_items"."bid_id" = "bids"."id"
       inner join "item_informations" on "item_informations"."listing_item_id" = "bids"."listing_item_id"
        where "bids"."listing_item_id" = ? order by "bids"."updated_at" ASC limit ?' }

  console.log node_modules/knex/lib/helpers.js:75
    { method: 'select',
      options: {},
      timeout: false,
      cancelOnTimeout: false,
      bindings: [ 'pacMrSKhcNvp4xaMD7ht1pduFuCYHmpWtS', 0 ],
      __knexQueryUid: '9a13b9eb-696a-446a-ab09-3544705c4837',
      sql: 'select "bids".* from "bids" inner join "order_items" on "order_items"."bid_id" = "bids"."id"
       inner join "item_informations" on "item_informations"."listing_item_id" = "bids"."listing_item_id"
        where ("bids"."bidder" in (?)) order by "bids"."updated_at" ASC limit ?' }

 */
    public get tableName(): string { return 'bids'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Action(): string { return this.get('action'); }
    public set Action(value: string) { this.set('action', value); }

    public get Bidder(): string { return this.get('bidder'); }
    public set Bidder(value: string) { this.set('bidder', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public BidDatas(): Collection<BidData> {
       return this.hasMany(BidData, 'bid_id', 'id');
    }

    public ShippingAddress(): Address {
        return this.belongsTo(Address, 'address_id', 'id');
    }

    public OrderItem(): OrderItem {
        return this.hasOne(OrderItem);
    }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

}
