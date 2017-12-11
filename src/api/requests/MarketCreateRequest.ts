import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class MarketCreateRequest extends RequestBody {
    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public private_key: string;

    @IsNotEmpty()
    public address: string;
}
// tslint:enable:variable-name
