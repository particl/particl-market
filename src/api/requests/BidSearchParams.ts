import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import {BidMessageType} from "../enums/BidMessageType";

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    public action: BidMessageType;

    public listingItemId: number;

    public profileId: number;

}
// tslint:enable:variable-name
