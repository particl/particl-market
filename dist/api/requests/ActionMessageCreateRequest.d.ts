import { RequestBody } from '../../core/api/RequestBody';
import { MessageDataCreateRequest } from './MessageDataCreateRequest';
import { MessageObjectCreateRequest } from './MessageObjectCreateRequest';
import { MessageInfoCreateRequest } from './MessageInfoCreateRequest';
import { MessageEscrowCreateRequest } from './MessageEscrowCreateRequest';
export declare class ActionMessageCreateRequest extends RequestBody {
    action: string;
    nonce: string;
    accepted: boolean;
    listing_item_id: number;
    info: MessageInfoCreateRequest;
    escrow: MessageEscrowCreateRequest;
    data: MessageDataCreateRequest;
    objects: MessageObjectCreateRequest[];
}
