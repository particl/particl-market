import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class TestDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public model: string;

    @IsNotEmpty()
    public data: string;

    @IsNotEmpty()
    public withRelated: boolean;

}
// tslint:enable:variable-name
