import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class EscrowRatioCreateRequest extends RequestBody {

    @IsNotEmpty()
    public escrow_id: number;

    @IsNotEmpty()
    public buyer: number;

    @IsNotEmpty()
    public seller: number;

}
// tslint:enable:variable-name
