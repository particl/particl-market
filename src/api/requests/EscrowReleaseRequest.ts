import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class EscrowReleaseRequest extends RequestBody {

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public memo: string;

    @IsNotEmpty()
    public escrow: any;

    @IsNotEmpty()
    public action: string;

    public item: string;

}
// tslint:enable:variable-name
