import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class PriceTickerUpdateRequest extends RequestBody {
    @IsNotEmpty()
    public crypto_price_usd: string;

    @IsNotEmpty()
    public crypto_price_btc: string;

    @IsNotEmpty()
    public crypto_price_currency: string;
}
// tslint:enable:variable-name
