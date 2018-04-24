import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ListingItem } from './ListingItem';
import { BidData } from './BidData';
import { BidSearchParams } from '../requests/BidSearchParams';
import { Address } from './Address';
import { OrderItem } from './OrderItem';
export declare class Bid extends Bookshelf.Model<Bid> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<Bid>;
    static search(options: BidSearchParams, withRelated?: boolean): Promise<Collection<Bid>>;
    static getLatestBid(listingItemId: number, bidder: string): Promise<Bid>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Action: string;
    Bidder: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    BidDatas(): Collection<BidData>;
    ShippingAddress(): Address;
    OrderItem(): OrderItem;
    ListingItem(): ListingItem;
}
