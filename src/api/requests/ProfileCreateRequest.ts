import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { Address } from '../models/Address';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';

// tslint:disable:variable-name
export class ProfileCreateRequest extends RequestBody {

    @IsNotEmpty()
    public name: string;

    // @IsNotEmpty()
    public address: string;         // profile address

    // related
    public shippingAddresses: Address[];    // shipping addresses
    public cryptocurrencyAddresses: CryptocurrencyAddress[];    // cryptocurrency addresses

}
// tslint:enable:variable-name
