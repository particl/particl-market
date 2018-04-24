import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
export declare class ListingItemTemplateSearchParams extends RequestBody {
    page: number;
    pageLimit: number;
    order: SearchOrder;
    profileId: number;
    category: string | number;
    searchString: string;
}
