import { RequestBody } from '../../core/api/RequestBody';
export declare class ListingItemUpdateRequest extends RequestBody {
    hash: string;
    seller: string;
    market_id: number;
    itemInformation: any;
    paymentInformation: any;
    messagingInformation: any;
    listingItemObjects: any;
}
