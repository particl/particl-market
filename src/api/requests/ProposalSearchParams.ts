import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import * as _ from 'lodash';
import { ProposalType } from '../enums/ProposalType';

// tslint:disable:variable-name
export class ProposalSearchParams extends RequestBody {

    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.ASC;
    @IsEnum(ProposalType)
    public type: ProposalType = ProposalType.PUBLIC_VOTE;

    public startBlock: number | string;
    public endBlock: number | string;
}
// tslint:enable:variable-name
