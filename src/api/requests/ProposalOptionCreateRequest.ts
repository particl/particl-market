import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ProposalOptionCreateRequest extends RequestBody {

    @IsNotEmpty()
    public proposal_id: number;

    @IsNotEmpty()
    public optionId: number;

    @IsNotEmpty()
    public description: string;

}
// tslint:enable:variable-name
