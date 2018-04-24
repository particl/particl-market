/**
 * core.api.HashableListingItem
 *
 */
import * as resources from 'resources';
import { ListingItemCreateRequest } from '../../api/requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../../api/requests/ListingItemTemplateCreateRequest';
export declare class HashableListingItem {
    title: string;
    shortDescription: string;
    longDescription: string;
    basePrice: string;
    paymentAddress: string;
    messagingPublicKey: string;
    nullItemTimestamp: Date;
    constructor(hashThis: resources.ListingItem | resources.ListingItemTemplate | ListingItemCreateRequest | ListingItemTemplateCreateRequest, timestampedHash?: boolean);
}
