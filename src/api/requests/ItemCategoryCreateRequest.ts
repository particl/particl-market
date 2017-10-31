import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemCategoryCreateRequest extends RequestBody {

    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public description: string;

}

