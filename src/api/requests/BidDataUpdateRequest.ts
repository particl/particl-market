import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidDataUpdateRequest extends RequestBody {
  @IsNotEmpty()
  public bid_id: number;

  public dataId: string;

  public dataValue: string;
}
// tslint:enable:variable-name
