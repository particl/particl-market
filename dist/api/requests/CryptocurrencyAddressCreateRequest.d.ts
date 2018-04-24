import { RequestBody } from '../../core/api/RequestBody';
import { CryptocurrencyAddressType } from '../enums/CryptocurrencyAddressType';
export declare class CryptocurrencyAddressCreateRequest extends RequestBody {
    profile_id: number;
    type: CryptocurrencyAddressType;
    address: string;
}
