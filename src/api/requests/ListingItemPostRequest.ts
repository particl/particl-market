import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemPostRequest extends RequestBody {

    @IsNotEmpty()
    public listingItemTemplateId: number;
    public marketId: number;
}
// tslint:enable:variable-name
