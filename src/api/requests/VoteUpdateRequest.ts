import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class VoteUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public proposalOptionId: number;

    @IsNotEmpty()
    public voter: string;

    @IsNotEmpty()
    public block: number;

    @IsNotEmpty()
    public weight: number;

}
// tslint:enable:variable-name
