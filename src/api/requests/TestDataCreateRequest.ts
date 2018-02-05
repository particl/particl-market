import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CreatableModel } from '../enums/CreatableModel';

// tslint:disable:variable-name
export class TestDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public model: CreatableModel;

    @IsNotEmpty()
    public data: object;

    @IsNotEmpty()
    public withRelated?: boolean;

}
// tslint:enable:variable-name
