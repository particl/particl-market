import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class LocationMarkerUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public item_location_id: number;

    @IsNotEmpty()
    public lat: number;

    @IsNotEmpty()
    public lng: number;

    public markerTitle: string;

    public markerText: string;

}
// tslint:enable:variable-name
