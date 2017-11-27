import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class LocationMarkerUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public item_location_id: number;

    @IsNotEmpty()
    public markerTitle: string;

    @IsNotEmpty()
    public markerText: string;

    @IsNotEmpty()
    public lat: number;

    @IsNotEmpty()
    public lng: number;

}

