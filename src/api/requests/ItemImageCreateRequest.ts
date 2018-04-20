import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ItemImageDataCreateRequest } from './ItemImageDataCreateRequest';

// tslint:disable:variable-name
export class ItemImageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    // hash should be created in the service
    // @IsNotEmpty()
    public hash: string;

    // TODO: rename to datas
    // TODO: type should propably be ItemImageDataCreateRequest[]
    @IsNotEmpty()
    public data: any;

}
// tslint:enable:variable-name
