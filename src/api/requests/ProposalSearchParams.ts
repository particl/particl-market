import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import * as _ from 'lodash';

// tslint:disable:variable-name
export class ProposalSearchParams extends RequestBody {
    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.ASC;
    public withRelated: boolean;
    public startBlock: number;
    public endBlock: number;

    /*
     *  [0]: searchString, string, can be null
     *  [1]: withRelated, boolean
     */
    constructor(generateParams: any[] = []) {
        super(generateParams);
        // set params only if there are some -> by default all are true
        // if (!_.isEmpty(generateParams) ) {
        this.order                  = generateParams[0] ? generateParams[0] : SearchOrder.ASC;
        this.withRelated            = generateParams[1] ? generateParams[1] : true;
        this.startBlock            = generateParams[2] ? generateParams[2] : true;
        this.endBlock            = generateParams[3] ? generateParams[3] : true;
        // }
    }

    public toParamsArray(): any[] {
        return [
            this.order,
            this.withRelated,
            this.startBlock,
            this.endBlock
        ];
    }
}
// tslint:enable:variable-name
