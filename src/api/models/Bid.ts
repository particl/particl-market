import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';
import { BidSearchParams } from '../requests/BidSearchParams';
import { Address } from './Address';
import { OrderItem } from './OrderItem';

export class Bid extends Bookshelf.Model<Bid> {

    public static RELATIONS = [
        'BidDatas',
        'ShippingAddress',
        'ListingItem',
        'ListingItem.ListingItemTemplate',
        'OrderItem',
        'OrderItem.OrderItemObjects',
        'OrderItem.ListingItem',
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
        const bidCollection = Bid.forge<Collection<Bid>>()
            .query( qb => {

                if (options.listingItemId) {
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }

                if (options.action && typeof options.action === 'string') {
                    qb.where('bids.action', '=', options.action);
                }

                if (options.bidders) {
                    // let firstIteration = (options.bidder ? false : true);
                    for (const bidder of options.bidders) {
                        qb.orWhere('bids.bidder', '=', bidder);
/*
                        if (!firstIteration) {
                            qb.orWhere('bids.bidder', '=', bidder);
                        } else {
                            firstIteration = false;
                            qb.where('bids.bidder', '=', bidder);
                        }
*/
                    }
                }

            }).orderBy('bids.created_at', 'ASC');

        if (withRelated) {
            return await bidCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await bidCollection.fetchAll();
        }
    }

    public static async getLatestBid(listingItemId: number, bidder: string): Promise<Bid> {
        return await Bid.where<Bid>({ listing_item_id: listingItemId, bidder }).orderBy('created_at', 'DESC').fetch();
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

    public ListingItem(): ListingItem {
       return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

    public BidDatas(): Collection<BidData> {
       return this.hasMany(BidData, 'bid_id', 'id');
    }

    public ShippingAddress(): Address {
        return this.belongsTo(Address, 'address_id', 'id');
    }

    public OrderItem(): OrderItem {
        return this.hasOne(OrderItem);
    }
}
