import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ProfileUpdateRequest extends RequestBody {
    @IsNotEmpty()
    public name: string;
}

