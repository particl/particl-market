import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemImageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public hash: string;

}

