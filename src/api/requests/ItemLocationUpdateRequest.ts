import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { Country } from '../enums/Country';

// tslint:disable:variable-name
export class ItemLocationUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public region: Country;

    @IsNotEmpty()
    public address: string;

    public locationMarker;

}
// tslint:enable:variable-name
