import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ShoppingCartItemCreateRequest extends RequestBody {
    @IsNotEmpty()
    public shopping_cart_id: number;

    @IsNotEmpty()
    public listing_item_id: number;
}
// tslint:enable:variable-name
