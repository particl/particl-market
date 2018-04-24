import { RequestBody } from '../../core/api/RequestBody';
export declare class ListingItemCreateRequest extends RequestBody {
    hash: string;
    seller: string;
    market_id: number;
    listing_item_template_id: number;
    itemInformation: any;
    paymentInformation: any;
    messagingInformation: any;
    listingItemObjects: any;
    actionMessages: any;
}
