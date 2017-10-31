import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class EscrowRatioCreateRequest extends RequestBody {

    @IsNotEmpty()
    public buyer: number;

    @IsNotEmpty()
    public seller: number;

}

