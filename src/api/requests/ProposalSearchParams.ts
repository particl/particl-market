import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import * as _ from 'lodash';

// tslint:disable:variable-name
export class ProposalSearchParams extends RequestBody {
    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.ASC;
    public withRelated: boolean;

    /*
     *  [0]: searchString, string, can be null
     *  [1]: withRelated, boolean
     */
    constructor(generateParams: any[] = []) {
        super(generateParams);
        // set params only if there are some -> by default all are true
        // if (!_.isEmpty(generateParams) ) {
        this.order                  = generateParams[2] ? generateParams[2] : SearchOrder.ASC;
        this.withRelated            = generateParams[11] ? generateParams[11] : true;
        // }
    }

    public toParamsArray(): any[] {
        return [
            this.order,
            this.withRelated
        ];
    }
}
// tslint:enable:variable-name
