// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';
import { BidSearchParams } from '../requests/search/BidSearchParams';
import { SearchOrder } from '../enums/SearchOrder';
import { Address } from './Address';
import { OrderItem } from './OrderItem';
import { BidSearchOrderField } from '../enums/SearchOrderField';

export class Bid extends Bookshelf.Model<Bid> {

    public static RELATIONS = [
        'BidDatas',
        'ShippingAddress',
        'ShippingAddress.Profile',
        'OrderItem',
        'OrderItem.Order',
        'ParentBid',
        'ParentBid.BidDatas',
        'ParentBid.OrderItem',
        'ParentBid.OrderItem.Order',
        'ParentBid.ParentBid',
        'ParentBid.ParentBid.ParentBid',
        'ParentBid.ParentBid.ParentBid.ParentBid',
        'ChildBids',
        'ChildBids.BidDatas',
        'ListingItem',
        'ListingItem.ItemInformation',
        'ListingItem.ItemInformation.ItemCategory',
        'ListingItem.ItemInformation.ItemCategory.ParentItemCategory',
        'ListingItem.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory',
        'ListingItem.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
        'ListingItem.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
        'ListingItem.ItemInformation.ItemLocation',
        'ListingItem.ItemInformation.ItemLocation.LocationMarker',
        'ListingItem.ItemInformation.ItemImages',
        'ListingItem.ItemInformation.ItemImages.ItemImageDatas',
        'ListingItem.ItemInformation.ShippingDestinations',
        'ListingItem.PaymentInformation',
        'ListingItem.PaymentInformation.Escrow',
        'ListingItem.PaymentInformation.Escrow.Ratio',
        'ListingItem.PaymentInformation.ItemPrice',
        'ListingItem.PaymentInformation.ItemPrice.ShippingPrice',
        'ListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress',
        'ListingItem.MessagingInformation',
        'ListingItem.ListingItemObjects',
        'ListingItem.ListingItemObjects.ListingItemObjectDatas',
        'ListingItem.ListingItemTemplate',
        'ListingItem.ListingItemTemplate.Profile'
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

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<Bid> {
        if (withRelated) {
            return await Bid.where<Bid>({ hash: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Bid.where<Bid>({ hash: value }).fetch();
        }
    }

    public static async fetchByMsgId(value: string, withRelated: boolean = true): Promise<Bid> {
        if (withRelated) {
            return await Bid.where<Bid>({ msgid: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Bid.where<Bid>({ msgid: value }).fetch();
        }
    }

    public static async searchBy(options: BidSearchParams, withRelated: boolean = true): Promise<Collection<Bid>> {

        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || BidSearchOrderField.UPDATED_AT;

        const bidCollection = Bid.forge<Model<Bid>>()
            .query( qb => {

                if (options.listingItemId) {
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }

                if (options.type) {
                    qb.where('bids.type', '=', options.type);
                }
                /* all these should be Bids now...
                if (searchParams.type
                    && (searchParams.type === OrderItemStatus.AWAITING_ESCROW
                        || searchParams.type === OrderItemStatus.COMPLETE
                        || searchParams.type === OrderItemStatus.ESCROW_LOCKED
                        || searchParams.type === OrderItemStatus.ESCROW_COMPLETED
                        || searchParams.type === OrderItemStatus.SHIPPING)) {
                    qb.innerJoin('order_items', 'order_items.bid_id', 'bids.id');
                    qb.where('order_items.status', '=', searchParams.type);
                }
                */

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
            .orderBy('bids.' + options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
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

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Bidder(): string { return this.get('bidder'); }
    public set Bidder(value: string) { this.set('bidder', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get GeneratedAt(): number { return this.get('generatedAt'); }
    public set GeneratedAt(value: number) { this.set('generatedAt', value); }

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
        return this.hasOne(OrderItem, 'bid_id', 'id');
    }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

    public ParentBid(): Bid {
        return this.belongsTo(Bid, 'parent_bid_id', 'id');
    }

    public ChildBids(): Collection<Bid> {
        return this.hasMany(Bid, 'parent_bid_id', 'id');
    }

}
