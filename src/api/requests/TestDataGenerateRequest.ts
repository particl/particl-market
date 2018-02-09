import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CreatableModel } from '../enums/CreatableModel';

// tslint:disable:variable-name
export class TestDataGenerateRequest extends RequestBody {

    @IsNotEmpty()
    public model: CreatableModel;

    @IsNotEmpty()
    public amount: number;

    @IsNotEmpty()
    public withRelated: boolean;

    public generateParams: boolean[];

}
// tslint:enable:variable-name
