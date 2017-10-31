import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class EscrowUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

}

