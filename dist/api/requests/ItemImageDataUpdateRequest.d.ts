import { RequestBody } from '../../core/api/RequestBody';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
export declare class ItemImageDataUpdateRequest extends RequestBody {
    item_image_id: number;
    dataId: string | null;
    protocol: ImageDataProtocolType;
    imageVersion: string;
    encoding: string | null;
    data: string | null;
    originalMime: string | null;
    originalName: string | null;
}
