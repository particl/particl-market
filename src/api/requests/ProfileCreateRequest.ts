import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { AddressCreateRequest } from './AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from './CryptocurrencyAddressCreateRequest';

// tslint:disable:variable-name
export class ProfileCreateRequest extends RequestBody {

    @IsNotEmpty()
    public name: string;

    // @IsNotEmpty()
    public address: string;         // profile address

    // related
    public shippingAddresses: AddressCreateRequest[];    // shipping addresses
    public cryptocurrencyAddresses: CryptocurrencyAddressCreateRequest[];    // cryptocurrency addresses

}
// tslint:enable:variable-name
