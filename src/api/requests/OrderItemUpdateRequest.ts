import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class OrderItemUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public status: string;

}
// tslint:enable:variable-name
