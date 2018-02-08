import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class PriceTickerCreateRequest extends RequestBody {

    @IsNotEmpty()
    public crypto_id: string;

    @IsNotEmpty()
    public crypto_name: string;

    @IsNotEmpty()
    public crypto_symbol: string;

    @IsNotEmpty()
    public crypto_price_usd: string;

    @IsNotEmpty()
    public crypto_price_btc: string;

    @IsNotEmpty()
    public crypto_price_currency: string;

    @IsNotEmpty()
    public convert_currency: string;
}
// tslint:enable:variable-name
