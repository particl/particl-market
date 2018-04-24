import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { BidDataCreateRequest } from './BidDataCreateRequest';
export declare class BidUpdateRequest extends RequestBody {
    listing_item_id: number;
    action: BidMessageType;
    bidder: string;
    bidDatas: BidDataCreateRequest[];
}
