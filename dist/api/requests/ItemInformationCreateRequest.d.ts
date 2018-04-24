import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemInformationCreateRequest extends RequestBody {
    listing_item_id: number;
    listing_item_template_id: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    itemCategory: any;
    itemLocation: any;
    shippingDestinations: any;
    itemImages: any;
}
