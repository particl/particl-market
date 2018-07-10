import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ProposalResultCreateRequest extends RequestBody {

    @IsNotEmpty()
    public proposalId: number;

    @IsNotEmpty()
    public block: number;

}
// tslint:enable:variable-name
