import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class EscrowLockRequest extends RequestBody {

    @IsNotEmpty()
    public escrowId: number;

    @IsNotEmpty()
    public addressId: number;

    @IsNotEmpty()
    public itemHash: string;

    @IsNotEmpty()
    public memo: string;
    
}
// tslint:enable:variable-name
