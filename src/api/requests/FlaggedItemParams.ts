import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class FlaggedItemParams extends RequestBody {

    @IsNotEmpty()
    public listingItemId: string | number;

}
// tslint:enable:variable-name
