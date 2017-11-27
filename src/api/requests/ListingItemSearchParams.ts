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

    public searchString: string;

}
// tslint:enable:variable-name
