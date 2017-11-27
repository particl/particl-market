import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemCategoryUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public parent_item_category_id: number;

    public key: string;

    @IsNotEmpty()
    public name: string;

    public description: string;

}

