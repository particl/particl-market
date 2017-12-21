import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class EscrowRefundRequest extends RequestBody {

    @IsNotEmpty()
    public escrowId: number;

    @IsNotEmpty()
    public itemHash: string;

    @IsNotEmpty()
    public accepted: boolean;

    @IsNotEmpty()
    public memo: string;

}
// tslint:enable:variable-name
