import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';

// tslint:disable:variable-name
export class ListingItemSearchParams extends RequestBody {

    @IsNotEmpty()
    public page: number;

    @IsNotEmpty()
    public pageLimit: number;

    @IsNotEmpty()
    @IsEnum(SearchOrder)
    public order: SearchOrder;

    public category: string | number;

    public profileId: string | number;

    public minPrice: number;

    public maxPrice: number;

    public country: string;

    public shippingDestination: string;

    public searchString: string;

}
// tslint:enable:variable-name
