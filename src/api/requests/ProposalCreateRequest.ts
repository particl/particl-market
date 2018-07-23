import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ProposalType } from '../enums/ProposalType';
import { ProposalOptionCreateRequest } from '../requests/ProposalOptionCreateRequest';

// tslint:disable:variable-name
export class ProposalCreateRequest extends RequestBody {

    @IsNotEmpty()
    public submitter: string;

    @IsNotEmpty()
    public blockStart: number;

    @IsNotEmpty()
    public blockEnd: number;

    // @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    @IsEnum(ProposalType)
    public type: ProposalType;

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public description: string;

    public options: ProposalOptionCreateRequest[];

}
// tslint:enable:variable-name
