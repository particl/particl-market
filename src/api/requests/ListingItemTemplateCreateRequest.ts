import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemTemplateCreateRequest extends RequestBody {

    @IsNotEmpty()
    public hash: string;
}
// tslint:enable:variable-name
