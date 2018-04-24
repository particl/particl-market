import { RequestBody } from '../../core/api/RequestBody';
import { EscrowType } from '../enums/EscrowType';
export declare class EscrowCreateRequest extends RequestBody {
    payment_information_id: number;
    type: EscrowType;
    ratio: any;
}
