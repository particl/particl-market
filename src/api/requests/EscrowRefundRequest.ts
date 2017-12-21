import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class EscrowRefundRequest extends RequestBody {

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public accepted: boolean;

    @IsNotEmpty()
    public memo: string;

    @IsNotEmpty()
    public escrow: any;

    @IsNotEmpty()
    public action: string;

    public item: string;

    public address?: any;

}
// tslint:enable:variable-name
