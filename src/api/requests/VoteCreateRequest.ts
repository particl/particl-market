import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class VoteCreateRequest extends RequestBody {
    @IsNotEmpty()
    public proposal_option_id: number;

    @IsNotEmpty()
    public voter: string;

    @IsNotEmpty()
    public block: number;

    @IsNotEmpty()
    public weight: number;

}
// tslint:enable:variable-name
