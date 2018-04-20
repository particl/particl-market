import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(BidMessageType)
    public action: BidMessageType;

    // @IsNotEmpty()
    public listingItemId: number;
    public listingItemHash: string; // if hash is given, the service will fetch the id

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(SearchOrder)
    public ordering: SearchOrder;

    public bidders: string[];

}
// tslint:enable:variable-name
