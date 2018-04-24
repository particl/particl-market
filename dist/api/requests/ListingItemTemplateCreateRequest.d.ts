import { RequestBody } from '../../core/api/RequestBody';
export declare class ListingItemTemplateCreateRequest extends RequestBody {
    profile_id: number;
    hash: string;
    itemInformation: any;
    paymentInformation: any;
    messagingInformation: any;
    listingItemObjects: any;
}
