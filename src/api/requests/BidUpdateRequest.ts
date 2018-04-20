import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import {BidDataCreateRequest} from './BidDataCreateRequest';

// tslint:disable:variable-name
export class BidUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public listing_item_id: number;

    @IsEnum(BidMessageType)
    @IsNotEmpty()
    public action: BidMessageType;

    @IsNotEmpty()
    public bidder: string;

    public bidDatas: BidDataCreateRequest[];
}
// tslint:enable:variable-name
