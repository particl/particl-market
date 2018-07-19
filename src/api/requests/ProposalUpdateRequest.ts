import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ProposalType } from '../enums/ProposalType';
import { ProposalOptionCreateRequest } from './ProposalOptionCreateRequest';

// tslint:disable:variable-name
export class ProposalUpdateRequest extends RequestBody {

    public submitter: string;
    public blockStart: number;
    public blockEnd: number;
    public hash: string;
    @IsEnum(ProposalType)
    public type: string;
    public description: string;
    public options: ProposalOptionCreateRequest[];

}
// tslint:enable:variable-name
