import * as resources from 'resources';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';

export interface MessageCreateParams {
    //
}

export interface ListingItemAddMessageCreateParams extends MessageCreateParams {
    template: resources.ListingItemTemplate;
}

export interface BidMessageCreateParams extends MessageCreateParams {
    config: BidConfiguration;
    itemHash: string;                   // item hash to bid for
    generated?: number;                 // timestamp, when the bidder generated this bid
}
