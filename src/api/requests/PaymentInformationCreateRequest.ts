import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { PaymentType } from '../../api/enums/PaymentType';

// tslint:disable:variable-name
export class PaymentInformationCreateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(PaymentType)
    @IsNotEmpty()
    public type: PaymentType;

    public escrow;
    public itemPrice;

}
// tslint:enable:variable-name
