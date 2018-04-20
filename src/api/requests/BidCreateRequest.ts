import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import {BidDataCreateRequest} from './BidDataCreateRequest';
import {AddressCreateRequest} from './AddressCreateRequest';

// tslint:disable:variable-name
export class BidCreateRequest extends RequestBody {

    @IsNotEmpty()
    public listing_item_id: number;

    @IsEnum(BidMessageType)
    @IsNotEmpty()
    public action: BidMessageType;

    @IsNotEmpty()
    public address: AddressCreateRequest;

    public address_id: number;

    @IsNotEmpty()
    public bidder: string;

    public bidDatas: BidDataCreateRequest[];
}
// tslint:enable:variable-name
