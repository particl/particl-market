import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';


export class ListingItemTemplateSearchParams extends RequestBody {

    @IsNotEmpty()
    public page: number;

    @IsNotEmpty()
    public pageLimit: number;

    @IsNotEmpty()
    @IsEnum(SearchOrder)
    public order: SearchOrder;

    @IsNotEmpty()
    public profileId: number;

    public category: string | number;

    public searchString: string;

}

