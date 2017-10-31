import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ListingItemObjectUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public description: string;

    @IsNotEmpty()
    public order: number;

}

