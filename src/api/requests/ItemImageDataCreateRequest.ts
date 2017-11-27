import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ItemImageDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_image_id: number;

    // @IsNotEmpty()
    public dataId: string;

    // @IsNotEmpty()
    public protocol: string;

    // @IsNotEmpty()
    public encoding: string;

    // @IsNotEmpty()
    public data: string;

}
// tslint:enable:variable-name
