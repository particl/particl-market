import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { MessageObjectCreateRequest } from './MessageObjectCreateRequest';

// tslint:disable:variable-name
export class ActionMessageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public action: string;

    @IsNotEmpty()
    public nonce: string;

    @IsNotEmpty()
    public accepted: boolean;

    @IsNotEmpty()
    public listing_item_id: number;

    @IsNotEmpty()
    public message_info_id: number;

    @IsNotEmpty()
    public message_escrow_id: number;

    @IsNotEmpty()
    public message_data_id: number;

    public objects: MessageObjectCreateRequest[];
}
// tslint:enable:variable-name
