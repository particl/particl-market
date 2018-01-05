import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';

// tslint:disable:variable-name
export class EscrowRefundRequest extends RequestBody {

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public accepted: boolean;

    @IsNotEmpty()
    public memo: string;

    @IsNotEmpty()
    public escrowId: any;

    @IsEnum(EscrowMessageType)
    @IsNotEmpty()
    public action: EscrowMessageType;

}
// tslint:enable:variable-name
