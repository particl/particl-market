import { RequestBody } from '../../core/api/RequestBody';
export declare class MessageDataCreateRequest extends RequestBody {
    action_message_id: number;
    msgid: string;
    version: string;
    received: Date;
    sent: Date;
    from: string;
    to: string;
}
