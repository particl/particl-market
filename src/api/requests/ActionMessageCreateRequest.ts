import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { MessageDataCreateRequest } from './MessageDataCreateRequest';
import { MessageObjectCreateRequest } from './MessageObjectCreateRequest';
import { MessageInfoCreateRequest } from './MessageInfoCreateRequest';
import { MessageEscrowCreateRequest } from './MessageEscrowCreateRequest';

// tslint:disable:variable-name
export class ActionMessageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public action: string;

    public nonce: string;
    public accepted: boolean;

    public listing_item_id: number;

    public info: MessageInfoCreateRequest;
    public escrow: MessageEscrowCreateRequest;
    public data: MessageDataCreateRequest;
    public objects: MessageObjectCreateRequest[];
}
// tslint:enable:variable-name
