import { RequestBody } from '../../core/api/RequestBody';
import { ListingItemObjectType } from '../../api/enums/ListingItemObjectType';
export declare class ListingItemObjectUpdateRequest extends RequestBody {
    listing_item_id: number;
    listing_item_template_id: number;
    type: ListingItemObjectType;
    description: string;
    order: number;
    listingItemObjectDatas: any;
}
