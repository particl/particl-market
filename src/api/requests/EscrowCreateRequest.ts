import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowType } from '../enums/EscrowType';

// tslint:disable:variable-name
export class EscrowCreateRequest extends RequestBody {

    @IsNotEmpty()
    public payment_information_id: number;

    @IsNotEmpty()
    public type: EscrowType;

    public ratio;

}
// tslint:enable:variable-name
