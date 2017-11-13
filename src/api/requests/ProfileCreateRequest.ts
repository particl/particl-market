import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ProfileCreateRequest extends RequestBody {
    @IsNotEmpty()
    public name: string;
}

