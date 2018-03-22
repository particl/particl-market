import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemObjectDataUpdateRequest extends RequestBody {

    public listing_item_object_id: number;

    @IsNotEmpty()
    public key: string;

    @IsNotEmpty()
    public value: string;
}
// tslint:enable:variable-name
