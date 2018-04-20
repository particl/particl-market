import { ActionMessageInterface } from './ActionMessageInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';

export class MarketplaceMessage {
    public version: string;
    public mpaction?: ActionMessageInterface;
    public item?: ListingItemMessageInterface;
    public market?: string;
    // todo: market is defined here, but it is not required on the message as the market address will be taken
    // from the message recipient field. the market is set later after message is received to make message
    // processing easier.
    // todo: we might anyway want to add this to OMP specs and perhaps check that market here matches the market
    // that we are sending the message to.

}
