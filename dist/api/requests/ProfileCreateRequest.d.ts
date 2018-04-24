import { RequestBody } from '../../core/api/RequestBody';
import { AddressCreateRequest } from './AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from './CryptocurrencyAddressCreateRequest';
export declare class ProfileCreateRequest extends RequestBody {
    name: string;
    address: string;
    shippingAddresses: AddressCreateRequest[];
    cryptocurrencyAddresses: CryptocurrencyAddressCreateRequest[];
}
