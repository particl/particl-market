import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemCategoryUpdateRequest extends RequestBody {
    parent_item_category_id: number;
    id: number;
    key: string;
    name: string;
    description: string;
}
