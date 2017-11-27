import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemCreateRequest extends RequestBody {

    @IsNotEmpty()
    public hash: string;

}
// tslint:enable:variable-name
