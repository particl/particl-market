import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CryptocurrencyAddressType } from '../enums/CryptocurrencyAddressType';

// tslint:disable:variable-name
export class CryptocurrencyAddressCreateRequest extends RequestBody {

    public profile_id: number;

    @IsEnum(CryptocurrencyAddressType)
    @IsNotEmpty()
    public type: CryptocurrencyAddressType;

    @IsNotEmpty()
    public address: string;

}
// tslint:enable:variable-name
