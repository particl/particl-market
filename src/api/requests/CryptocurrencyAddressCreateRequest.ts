import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class CryptocurrencyAddressCreateRequest extends RequestBody {

    public profile_id: number;

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public address: string;

}
// tslint:enable:variable-name
