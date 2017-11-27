import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemLocationCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public region: string;

    @IsNotEmpty()
    public address: string;

}

