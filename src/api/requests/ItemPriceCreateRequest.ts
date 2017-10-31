import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemPriceCreateRequest extends RequestBody {

    @IsNotEmpty()
    public currency: string;

    @IsNotEmpty()
    public basePrice: number;

}

