import { RequestBody } from '../../core/api/RequestBody';
export declare class PriceTickerUpdateRequest extends RequestBody {
    crypto_id: string;
    crypto_name: string;
    crypto_symbol: string;
    crypto_rank: string;
    crypto_price_usd: string;
    crypto_price_btc: string;
    crypto_24h_volume_usd: string;
    crypto_market_cap_usd: string;
    crypto_available_supply: string;
    crypto_total_supply: string;
    crypto_max_supply: string;
    crypto_percent_change_1h: string;
    crypto_percent_change_24h: string;
    crypto_percent_change_7d: string;
    crypto_last_updated: string;
    crypto_price_eur: string;
    crypto_24h_volume_eur: string;
    crypto_market_cap_eur: string;
}
