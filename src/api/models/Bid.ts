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
import { Identity } from './Identity';
import { OrderItem } from './OrderItem';
import { BidSearchOrderField } from '../enums/SearchOrderField';
import { Logger as LoggerType } from '../../core/Logger';


export class Bid extends Bookshelf.Model<Bid> {

    public static log: LoggerType = new LoggerType(__filename);

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
        'ListingItem.ItemInformation.Images',
        'ListingItem.ItemInformation.Images.ImageDatas',
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
        'ListingItem.ListingItemTemplate.Profile',
        'Identity',
        'Identity.Profile'
    ];

    public static async fetchAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Collection<Bid>> {
        const BidCollection = Bid.forge<Model<Bid>>()
            .query(qb => {
                qb.join('identities', 'bids.identity_id', 'identities.id');
                qb.where('identities.profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        return BidCollection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByIdentityId(identityId: number, withRelated: boolean = true): Promise<Collection<Bid>> {
        const BidCollection = Bid.forge<Model<Bid>>()
            .query(qb => {
                qb.join('identities', 'bids.identity_id', 'identities.id');
                qb.where('bids.identity_id', '=', identityId);
            })
            .orderBy('id', 'ASC');

        return BidCollection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Bid> {
        return Bid.where<Bid>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<Bid> {
        return Bid.where<Bid>({ hash: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchByMsgId(value: string, withRelated: boolean = true): Promise<Bid> {
        return Bid.where<Bid>({ msgid: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async searchBy(options: BidSearchParams, withRelated: boolean = true): Promise<Collection<Bid>> {

        // Bid.log.debug('...searchBy by options: ', JSON.stringify(options, null, 2));

        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || BidSearchOrderField.UPDATED_AT;

        const collection = Bid.forge<Model<Bid>>()
            .query( qb => {

                qb.join('listing_items', 'bids.listing_item_id', 'listing_items.id');

                if (options.listingItemId) {
                    qb.andWhere( qbInner => {
                        return qbInner.where('listing_items.id', '=', options.listingItemId);
                    });
                }

                if (options.type) {
                    qb.andWhere( qbInner => {
                        return qbInner.where('bids.type', '=', options.type);
                    });
                }

                if (options.searchString) {
                    qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'bids.listing_item_id');
                    qb.andWhere( qbInner => {
                        return qbInner.where('item_informations.title', 'LIKE', '%' + options.searchString + '%')
                            .orWhere('item_informations.short_description', 'LIKE', '%' + options.searchString + '%')
                            .orWhere('item_informations.long_description', 'LIKE', '%' + options.searchString + '%');
                    });
                }

                if (options.market) {
                    qb.andWhere( qbInner => {
                        return qbInner.where('listing_items.market', '=', options.market);
                    });
                }

                if (options.identityId) {
                    qb.andWhere( qbInner => {
                        return qbInner.where('bids.identity_id', '=', options.identityId);
                    });
                }

                if (options.profileId) {
                    qb.join('identities', 'bids.identity_id', 'identities.id');
                    qb.andWhere( qbInner => {
                        return qbInner.where('identities.profile_id', '=', options.profileId);
                    });
                }

                if (options.orderItemStatus) {
                    qb.innerJoin('order_items', 'order_items.bid_id', 'bids.id');
                    qb.where('order_items.status', '=', options.orderItemStatus);
                }

                if (!_.isEmpty(options.bidders)) {
                    qb.andWhere( qbInner => {
                        return qbInner.whereIn('bids.bidder', options.bidders);
                    });
                }

            })
            .orderBy('bids.' + options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
                // debug: true
            });

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
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

    public get ExpiryTime(): number { return this.get('expiryTime'); }
    public set ExpiryTime(value: number) { this.set('expiryTime', value); }

    public get PostedAt(): number { return this.get('postedAt'); }
    public set PostedAt(value: number) { this.set('postedAt', value); }

    public get ExpiredAt(): number { return this.get('expiredAt'); }
    public set ExpiredAt(value: number) { this.set('expiredAt', value); }

    public get ReceivedAt(): number { return this.get('receivedAt'); }
    public set ReceivedAt(value: number) { this.set('receivedAt', value); }

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

    public Identity(): Identity {
        return this.belongsTo(Identity, 'identity_id', 'id');
    }

}
