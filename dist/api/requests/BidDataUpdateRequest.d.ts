import { RequestBody } from '../../core/api/RequestBody';
export declare class BidDataUpdateRequest extends RequestBody {
    bid_id: number;
    dataId: string;
    dataValue: string;
}
