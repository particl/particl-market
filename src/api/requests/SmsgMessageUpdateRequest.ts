import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class SmsgMessageUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public status: string;

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
    public daysRetention: number;

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;

    @IsNotEmpty()
    public text: string;

}
// tslint:enable:variable-name
