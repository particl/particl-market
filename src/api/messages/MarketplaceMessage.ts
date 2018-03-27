import { ActionMessageInterface } from './ActionMessageInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';

export class MarketplaceMessage {
    public version: string;
    public mpaction?: ActionMessageInterface;
    public item?: ListingItemMessageInterface;
    public market?: string;
}
