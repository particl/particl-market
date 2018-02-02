import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ShoppingCartsUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public name: string;

}
// tslint:enable:variable-name
