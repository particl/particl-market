import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidCreateRequest extends RequestBody {
    @IsNotEmpty()
    public listing_item_id: number;

    @IsNotEmpty()
    public status: string;

}
// tslint:enable:variable-name
