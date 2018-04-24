import { RequestBody } from '../../core/api/RequestBody';
import { PaymentType } from '../../api/enums/PaymentType';
export declare class PaymentInformationCreateRequest extends RequestBody {
    listing_item_id: number;
    listing_item_template_id: number;
    type: PaymentType;
    escrow: any;
    itemPrice: any;
}
