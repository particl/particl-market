import { RequestBody } from '../../core/api/RequestBody';
import { CreatableModel } from '../enums/CreatableModel';
export declare class TestDataCreateRequest extends RequestBody {
    model: CreatableModel;
    data: any;
    withRelated?: boolean;
    timestampedHash?: boolean | undefined;
}
