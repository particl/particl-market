import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidDataUpdateRequest extends RequestBody {
  @IsNotEmpty()
  public bid_id: number;

  public data_id: string;

  public data_value: string;
}
// tslint:enable:variable-name
