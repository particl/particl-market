import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class PaymentInformationCreateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsNotEmpty()
    public type: string;

    public escrow;
    public itemPrice;

}
// tslint:enable:variable-name
