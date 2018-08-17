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
