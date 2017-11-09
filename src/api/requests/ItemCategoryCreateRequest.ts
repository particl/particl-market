import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemCategoryCreateRequest extends RequestBody {

    public key: string;

    @IsNotEmpty()
    public name: string;

    public description: string;

    public parentItemCategoryId: number;

}

