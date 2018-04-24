import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';
export declare class BidSearchParams extends RequestBody {
    action: BidMessageType;
    listingItemId: number;
    listingItemHash: string;
    ordering: SearchOrder;
    bidders: string[];
}
