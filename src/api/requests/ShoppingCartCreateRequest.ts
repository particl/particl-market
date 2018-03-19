import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ShoppingCartCreateRequest extends RequestBody {
    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public profile_id: number;
}
// tslint:enable:variable-name
