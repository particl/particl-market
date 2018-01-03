import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';

// tslint:disable:variable-name
export class BidCreateRequest extends RequestBody {

    @IsNotEmpty()
    public listing_item_id: number;

    @IsNotEmpty()
    public action: BidMessageType;

    public bidData: any;
}
// tslint:enable:variable-name
