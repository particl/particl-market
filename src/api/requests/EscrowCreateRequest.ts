import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class EscrowCreateRequest extends RequestBody {

    @IsNotEmpty()
    public payment_information_id: number;

    @IsNotEmpty()
    public type: string;

}

