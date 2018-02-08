import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class PriceTickerUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public crypto_id: string;

    @IsNotEmpty()
    public crypto_name: string;

    @IsNotEmpty()
    public crypto_symbol: string;

    @IsNotEmpty()
    public crypto_rank: string;



    @IsNotEmpty()
    public crypto_price_usd: string;

    @IsNotEmpty()
    public crypto_price_btc: string;



    public crypto_24h_volume_usd: string;

    public crypto_market_cap_usd: string;

    public crypto_available_supply: string;

    public crypto_total_supply: string;

    public crypto_max_supply: string;



    public crypto_percent_change_1h: string;

    public crypto_percent_change_24h: string;

    public crypto_percent_change_7d: string;



    public crypto_last_updated: string;

    public crypto_price_currency: string;

    public crypto_24h_volume_currency: string;

    public crypto_market_cap_currency: string;



    @IsNotEmpty()
    public currency: string;
}
// tslint:enable:variable-name
