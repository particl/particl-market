import { RequestBody } from '../../core/api/RequestBody';
import { AddressType } from '../enums/AddressType';
export declare class AddressCreateRequest extends RequestBody {
    profile_id: number;
    title: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: AddressType;
}
