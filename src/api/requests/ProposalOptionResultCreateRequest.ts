import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ProposalOptionResultCreateRequest extends RequestBody {

    @IsNotEmpty()
    public proposalResultId: number;

    @IsNotEmpty()
    public proposalOptionId: number;

    @IsNotEmpty()
    public weight: number;

    @IsNotEmpty()
    public voterCount: number;

}
// tslint:enable:variable-name
