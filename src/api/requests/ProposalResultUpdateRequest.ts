import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ProposalResultUpdateRequest extends RequestBody {

    // @IsNotEmpty()
    // public proposal_id: number;

    @IsNotEmpty()
    public block: number;

}
// tslint:enable:variable-name
