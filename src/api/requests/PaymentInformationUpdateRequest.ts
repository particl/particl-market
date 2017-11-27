import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class PaymentInformationUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

}
// tslint:enable:variable-name
