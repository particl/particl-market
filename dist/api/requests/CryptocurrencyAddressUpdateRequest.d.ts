import { RequestBody } from '../../core/api/RequestBody';
import { CryptocurrencyAddressType } from '../enums/CryptocurrencyAddressType';
export declare class CryptocurrencyAddressUpdateRequest extends RequestBody {
    profile_id: number;
    type: CryptocurrencyAddressType;
    address: string;
}
