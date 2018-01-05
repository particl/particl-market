import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public bid_id: number;

    @IsNotEmpty()
    public data_id: string;

    @IsNotEmpty()
    public data_value: string;

}
// tslint:enable:variable-name
