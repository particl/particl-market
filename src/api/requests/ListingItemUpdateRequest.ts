import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public hash: string;

}
// tslint:enable:variable-name
