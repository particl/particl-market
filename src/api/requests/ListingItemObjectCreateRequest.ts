import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ListingItemObjectType } from '../../api/enums/ListingItemObjectType';

// tslint:disable:variable-name
export class ListingItemObjectCreateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(ListingItemObjectType)
    @IsNotEmpty()
    public type: ListingItemObjectType;

    @IsNotEmpty()
    public description: string;

    @IsNotEmpty()
    public order: number;

}
// tslint:enable:variable-name
