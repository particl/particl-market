import { RequestBody } from '../../core/api/RequestBody';
export declare class LocationMarkerUpdateRequest extends RequestBody {
    item_location_id: number;
    lat: number;
    lng: number;
    markerTitle: string;
    markerText: string;
}
