import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class LockedOutputCreateRequest extends RequestBody {

    @IsNotEmpty()
    public txid: string;

    @IsNotEmpty()
    public vout: number;

    public amount: number;
    public data: string;
    public address: string;
    public scriptPubKey: string;

    @IsNotEmpty()
    public bid_id: number;

}
// tslint:enable:variable-name
