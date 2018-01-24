import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

export class ListingItemUpdatePostRequest extends RequestBody {

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public listingItemTemplateId: number;
}
