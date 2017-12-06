import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';
import { BidSearchParams } from '../requests/BidSearchParams';

export class Bid extends Bookshelf.Model<Bid> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Bid> {
        if (withRelated) {
            return await Bid.where<Bid>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'BidRelated',
                    // 'BidRelated.Related'
                ]
            });
        } else {
            return await Bid.where<Bid>({ id: value }).fetch();
        }
    }

    public static async search(options: BidSearchParams, withRelated: boolean = true): Promise<Collection<Bid>> {
        const bidCollection = Bid.forge<Collection<Bid>>()
            .query( qb => {
                if (typeof options.listingItemId === 'number') {
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }
                if (typeof options.profileId === 'number') {
                    qb.innerJoin('listing_items', 'listing_items.id', 'bids.listing_item_id');
                    qb.innerJoin('listing_item_templates', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                    qb.where('listing_item_templates.profile_id', '=', options.profileId);
                }
                if (options.status && typeof options.status === 'string') {
                    qb.where('bids.status', '=', options.status);
                }

            })
            .orderBy('bids.created_at', 'ASC');
        if (withRelated) {
            return await bidCollection.fetchAll({
                withRelated: [
                  'ListingItem',
                  'BidData'
                ]
            });
        } else {
            return await bidCollection.fetchAll();
        }
    }

    public get tableName(): string { return 'bids'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Status(): string { return this.get('status'); }
    public set Status(value: string) { this.set('status', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ListingItem(): ListingItem {
       return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

    public BidData(): BidData {
       return this.hasOne(BidData);
    }

    // TODO: add related
    // public BidRelated(): BidRelated {
    //    return this.hasOne(BidRelated);
    // }
}
