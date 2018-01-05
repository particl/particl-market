import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';

// tslint:disable:variable-name
export class BidUpdateRequest extends RequestBody {
  @IsNotEmpty()
  public listing_item_id: number;

  @IsEnum(BidMessageType)
  @IsNotEmpty()
  public action: BidMessageType;
}
// tslint:enable:variable-name
