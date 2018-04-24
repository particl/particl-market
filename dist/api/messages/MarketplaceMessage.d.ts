import { ActionMessageInterface } from './ActionMessageInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';
export declare class MarketplaceMessage {
    version: string;
    mpaction?: ActionMessageInterface;
    item?: ListingItemMessageInterface;
    market?: string;
}
