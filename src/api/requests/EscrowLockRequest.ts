import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class EscrowLockRequest extends RequestBody {

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public nonce: string;

    @IsNotEmpty()
    public address: any;

    @IsNotEmpty()
    public escrow: any;

    @IsNotEmpty()
    public memo: string;

    @IsNotEmpty()
    public action: string;

    public item: string;
}
// tslint:enable:variable-name
