import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';

// tslint:disable:variable-name
export class EscrowLockRequest extends RequestBody {

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public nonce: string;

    @IsNotEmpty()
    public addressId: number;

    @IsNotEmpty()
    public escrowId: number;

    @IsNotEmpty()
    public memo: string;

    @IsNotEmpty()
    public action: EscrowMessageType;

}
// tslint:enable:variable-name
