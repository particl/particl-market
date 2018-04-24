import { RequestBody } from '../../core/api/RequestBody';
export declare class ItemImageDataCreateRequest extends RequestBody {
    item_image_id: number;
    dataId: string | null;
    protocol: string;
    imageVersion: string;
    encoding: string | null;
    data: string | null;
    originalMime: string | null;
    originalName: string | null;
}
