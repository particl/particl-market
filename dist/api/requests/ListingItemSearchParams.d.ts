import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import { ListingItemSearchType } from '../enums/ListingItemSearchType';
export declare class ListingItemSearchParams extends RequestBody {
    page: number;
    pageLimit: number;
    order: SearchOrder;
    category: string | number;
    type: ListingItemSearchType;
    profileId: string | number;
    minPrice: number | null;
    maxPrice: number | null;
    country: string;
    shippingDestination: string;
    searchString: string;
    withRelated: boolean;
    constructor(generateParams?: any[]);
    toParamsArray(): any[];
}
