import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidUpdateRequest extends RequestBody {
  @IsNotEmpty()
  public listing_item_id: number;

  @IsNotEmpty()
  public action: string;
}
// tslint:enable:variable-name
