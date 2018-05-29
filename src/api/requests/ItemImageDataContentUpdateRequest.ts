import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ItemImageDataContentUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public data: string;

}
// tslint:enable:variable-name
