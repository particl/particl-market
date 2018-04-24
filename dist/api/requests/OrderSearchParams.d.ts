import { RequestBody } from '../../core/api/RequestBody';
import { OrderStatus } from '../enums/OrderStatus';
import { SearchOrder } from '../enums/SearchOrder';
export declare class OrderSearchParams extends RequestBody {
    listingItemId: number;
    listingItemHash: string;
    status: OrderStatus;
    buyerAddress: string;
    sellerAddress: string;
    ordering: SearchOrder;
}
