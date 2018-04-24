import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemCategoryCreateRequest extends RequestBody {
    parent_item_category_id: number;
    key: string;
    name: string;
    description: string;
}
