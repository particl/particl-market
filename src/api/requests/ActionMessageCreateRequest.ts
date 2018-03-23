import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ActionMessageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public action: string;

    @IsNotEmpty()
    public nonce: string;

    @IsNotEmpty()
    public accepted: boolean;

}
// tslint:enable:variable-name
