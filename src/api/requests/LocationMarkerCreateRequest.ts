import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class LocationMarkerCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_location_id: number;

    public markerTitle: string;

    public markerText: string;

    public lat: number;

    public lng: number;

}
// tslint:enable:variable-name
