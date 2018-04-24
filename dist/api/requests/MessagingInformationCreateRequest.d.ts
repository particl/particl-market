import { RequestBody } from '../../core/api/RequestBody';
import { MessagingProtocolType } from '../../api/enums/MessagingProtocolType';
export declare class MessagingInformationCreateRequest extends RequestBody {
    listing_item_id: number;
    listing_item_template_id: number;
    protocol: MessagingProtocolType;
    publicKey: string;
}
