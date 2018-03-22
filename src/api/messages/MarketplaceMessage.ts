import { ActionMessageInterface } from './ActionMessageInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';
import { MarketplaceMessageInterface } from './MarketplaceMessageInterface';

export class MarketplaceMessage implements MarketplaceMessageInterface {
    public version: string;
    public mpaction?: ActionMessageInterface;
    public item?: ListingItemMessageInterface;
    public market?: string;
}
