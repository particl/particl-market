import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderStatus } from '../enums/OrderStatus';
import { SearchOrder } from '../enums/SearchOrder';

// tslint:disable:variable-name
export class OrderSearchParams extends RequestBody {
    // @IsNotEmpty()
    public listingItemId: number;
    public listingItemHash: string; // if hash is given, the service will fetch the id

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(BidMessageType)
    public status: OrderStatus;

    public buyerAddress: string;
    public sellerAddress: string;

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(SearchOrder)
    public ordering: SearchOrder;
}
// tslint:enable:variable-name
