import { RequestBody } from '../../core/api/RequestBody';
export declare class MessageEscrowCreateRequest extends RequestBody {
    action_message_id: number;
    type: string;
    rawtx: string;
}
