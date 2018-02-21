import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class FlaggedItemCreateRequest extends RequestBody {

    @IsNotEmpty()
    public listingItemId: number;

}
// tslint:enable:variable-name
