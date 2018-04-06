import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    @ValidateIf(o => o.action)
    @IsEnum(BidMessageType)
    public action: BidMessageType;

    // @IsNotEmpty()
    // TODO: id or hash should propably be required
    public listingItemId: number;
    public listingItemHash: string;

    public bidder: string;
    public bidders: string[];

}
// tslint:enable:variable-name
