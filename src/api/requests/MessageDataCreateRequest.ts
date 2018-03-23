import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class MessageDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public msgid: string;

    @IsNotEmpty()
    public version: string;

    @IsNotEmpty()
    public received: Date;

    @IsNotEmpty()
    public sent: Date;

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;

}
// tslint:enable:variable-name
