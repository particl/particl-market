import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import * as resources from 'resources';
export declare class EscrowRequest extends RequestBody {
    orderItem: resources.OrderItem;
    nonce?: string;
    accepted?: boolean;
    memo: string;
    action: EscrowMessageType;
}
