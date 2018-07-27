import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemTemplatePostRequest extends RequestBody {

    @IsNotEmpty()
    public listingItemTemplateId: number;
    public marketId: number;
    // expiry time in days
    public daysRetention: number;
    public postedAt: Date;
}
// tslint:enable:variable-name
