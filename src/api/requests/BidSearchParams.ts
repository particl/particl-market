import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    public listingItemId: number;

    public profileId: number;


}
// tslint:enable:variable-name
