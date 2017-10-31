import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class MessagingInformationCreateRequest extends RequestBody {

    @IsNotEmpty()
    public protocol: string;

    @IsNotEmpty()
    public publicKey: string;

}

