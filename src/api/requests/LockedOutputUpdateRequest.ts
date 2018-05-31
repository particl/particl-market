import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class LockedOutputUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public txid: string;

    @IsNotEmpty()
    public vout: number;

    public amount: number;
    public data: string;
    public address: string;
    public scriptPubKey: string;

}
// tslint:enable:variable-name
