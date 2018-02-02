import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

export class ListingItemObjectSearchParams extends RequestBody {

    @IsNotEmpty()
    public searchString: string;

}
