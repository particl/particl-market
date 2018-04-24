import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemLocationCreateRequest extends RequestBody {
    item_information_id: number;
    region: string;
    address: string;
    locationMarker: any;
}
