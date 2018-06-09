import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ItemImageDataContentCreateRequest extends RequestBody {

    public item_image_data_id: number;

    @IsNotEmpty()
    public data: string;

}
// tslint:enable:variable-name
