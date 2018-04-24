import { RequestBody } from '../../core/api/RequestBody';
export declare class AddressUpdateRequest extends RequestBody {
    title: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}
