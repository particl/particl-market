import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class AddressCreateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    public title: string;

    @IsNotEmpty()
    public addressLine1: string;

    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public profileId: string;
}
