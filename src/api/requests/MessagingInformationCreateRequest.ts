import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { MessagingProtocolType } from '../../api/enums/MessagingProtocolType';

// tslint:disable:variable-name
export class MessagingInformationCreateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(MessagingProtocolType)
    @IsNotEmpty()
    public protocol: MessagingProtocolType;

    @IsNotEmpty()
    public publicKey: string;

}
// tslint:enable:variable-name
