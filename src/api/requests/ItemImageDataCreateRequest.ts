import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';

// tslint:disable:variable-name
export class ItemImageDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_image_id: number;

    // @IsNotEmpty()
    public dataId: string;

    // @IsNotEmpty()
    @IsEnum(ImageDataProtocolType)
    public protocol: ImageDataProtocolType;

    // @IsNotEmpty()
    public encoding: string;

    // @IsNotEmpty()
    public data: string;

}
// tslint:enable:variable-name
