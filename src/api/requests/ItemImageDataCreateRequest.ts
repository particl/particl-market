import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import {ImageVersion} from '../../core/helpers/ImageVersion';

// tslint:disable:variable-name
export class ItemImageDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_image_id: number;

    // @IsNotEmpty()
    public dataId: string | null;

    @IsNotEmpty()
    @IsEnum(ImageDataProtocolType)
    public protocol: ImageDataProtocolType;

    @IsNotEmpty()
    public imageVersion: string;

    // @IsNotEmpty()
    public encoding: string | null;

    // @IsNotEmpty()
    public data: string | null;

}
// tslint:enable:variable-name
