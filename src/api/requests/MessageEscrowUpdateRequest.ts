import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class MessageEscrowUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public rawtx: string;

}
// tslint:enable:variable-name
