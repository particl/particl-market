import { IsNotEmpty, IsDefined, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import {AddressType} from '../enums/AddressType';

// tslint:disable:variable-name
export class AddressCreateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    public title: string;

    public firstName: string;
    public lastName: string;

    @IsNotEmpty()
    public addressLine1: string;
    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsDefined()
    public state: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public zipCode: string;

    @IsNotEmpty()
    public type: AddressType;

}
// tslint:enable:variable-name
