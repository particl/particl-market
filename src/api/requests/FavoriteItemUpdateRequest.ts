import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class FavoriteItemUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    @IsNotEmpty()
    public listing_item_id: number;

}
// tslint:enable:variable-name

