import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ListingItemTemplateCreateRequest extends RequestBody {

    @IsNotEmpty()
    public hash: string;
}

