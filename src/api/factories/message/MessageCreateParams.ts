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

export interface BidAcceptMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to accept
}

export interface BidCancelMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to cancel
}

export interface BidRejectMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to reject
}

export interface EscrowLockMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to reject
    memo?: string;
}

export interface EscrowRefundMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to refund
}

export interface EscrowReleaseMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to release
}


