import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';

// tslint:disable:variable-name
export class SmsgMessageUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public status: SmsgMessageStatus;

    @IsNotEmpty()
    public msgid: string;

    @IsNotEmpty()
    public version: string;

    @IsNotEmpty()
    public received: Date;

    @IsNotEmpty()
    public sent: Date;

    @IsNotEmpty()
    public expiration: Date;

    @IsNotEmpty()
    public daysretention: number;

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;

    public text: string;

}
// tslint:enable:variable-name
