import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';

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

    public get tableName(): string { return 'bids'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Status(): number { return this.get('status'); }
    public set Status(value: number) { this.set('status', value); }

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
