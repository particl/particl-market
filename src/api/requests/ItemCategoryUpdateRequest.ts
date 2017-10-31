import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemCategoryUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public description: string;

}

