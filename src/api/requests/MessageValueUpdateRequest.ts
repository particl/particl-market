import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class MessageValueUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public key: string;

    @IsNotEmpty()
    public value: string;

}
// tslint:enable:variable-name
