import { RequestBody } from '../../core/api/RequestBody';
import { CreatableModel } from '../enums/CreatableModel';
export declare class TestDataGenerateRequest extends RequestBody {
    model: CreatableModel;
    amount: number;
    withRelated: boolean;
    generateParams: any[];
}
