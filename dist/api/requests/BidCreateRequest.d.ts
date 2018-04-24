import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { BidDataCreateRequest } from './BidDataCreateRequest';
import { AddressCreateRequest } from './AddressCreateRequest';
export declare class BidCreateRequest extends RequestBody {
    listing_item_id: number;
    action: BidMessageType;
    address: AddressCreateRequest;
    address_id: number;
    bidder: string;
    bidDatas: BidDataCreateRequest[];
}
