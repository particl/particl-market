import { RequestBody } from '../../core/api/RequestBody';
export declare class MessageDataUpdateRequest extends RequestBody {
    msgid: string;
    version: string;
    received: Date;
    sent: Date;
    from: string;
    to: string;
}
