import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';

// tslint:disable:variable-name
export class EscrowReleaseRequest extends RequestBody {

    @IsNotEmpty()
    public item: string;

    @IsNotEmpty()
    public memo: string;

    @IsEnum(EscrowMessageType)
    @IsNotEmpty()
    public action: EscrowMessageType;

}
// tslint:enable:variable-name
