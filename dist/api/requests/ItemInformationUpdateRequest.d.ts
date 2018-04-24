import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemInformationUpdateRequest extends RequestBody {
    id: number;
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
