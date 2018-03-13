import { ActionMessageInterface } from './ActionMessageInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';

export interface MarketplaceMessageInterface {
    version: string;
    mpaction?: ActionMessageInterface;
    item?: ListingItemMessageInterface;
}
