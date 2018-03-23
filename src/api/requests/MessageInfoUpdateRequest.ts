import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class MessageInfoUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public address: string;

    @IsNotEmpty()
    public memo: string;

}
// tslint:enable:variable-name
