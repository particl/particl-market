import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class TestDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public model: string;

    @IsNotEmpty()
    public data: string;

}
// tslint:enable:variable-name
