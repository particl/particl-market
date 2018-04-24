import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemLocationUpdateRequest extends RequestBody {
    item_information_id: number;
    region: string;
    address: string;
    locationMarker: any;
}
