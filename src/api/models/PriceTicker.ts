import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';


export class PriceTicker extends Bookshelf.Model<PriceTicker> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<PriceTicker> {
        if (withRelated) {
            return await PriceTicker.where<PriceTicker>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'PriceTickerRelated',
                    // 'PriceTickerRelated.Related'
                ]
            });
        } else {
            return await PriceTicker.where<PriceTicker>({ id: value }).fetch();
        }
    }

    public static async search(currency: string): Promise<Collection<PriceTicker>> {
        const priceTickerCollection = PriceTicker.forge<Collection<PriceTicker>>()
            .query(qb => {
                qb.where('currency', '=', currency);
            })
            .orderBy('id', 'ASC');

        return priceTickerCollection.fetchAll();
    }

    public get tableName(): string { return 'price_ticker'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public get CryptoId(): string { return this.get('crypto_id'); }
    public set CryptoId(value: string) { this.set('crypto_id', value); }

    public get CryptoName(): string { return this.get('crypto_name'); }
    public set CryptoName(value: string) { this.set('crypto_name', value); }

    public get CryptoSymbol(): string { return this.get('crypto_symbol'); }
    public set CryptoSymbol(value: string) { this.set('crypto_symbol', value); }

    public get CryptoRank(): string { return this.get('crypto_rank'); }
    public set CryptoRank(value: string) { this.set('crypto_rank', value); }

    public get CryptoPriceUsd(): string { return this.get('crypto_price_usd'); }
    public set CryptoPriceUsd(value: string) { this.set('crypto_price_usd', value); }

    public get CryptoPriceBtc(): string { return this.get('crypto_price_btc'); }
    public set CryptoPriceBtc(value: string) { this.set('crypto_price_btc', value); }

    public get Crypto24HVolumeUsd(): string { return this.get('crypto_24_h_volume_usd'); }
    public set Crypto24HVolumeUsd(value: string) { this.set('crypto_24_h_volume_usd', value); }

    public get CryptoMarketCapUsd(): string { return this.get('crypto_market_cap_usd'); }
    public set CryptoMarketCapUsd(value: string) { this.set('crypto_market_cap_usd', value); }

    public get CryptoAvailableSupply(): string { return this.get('crypto_available_supply'); }
    public set CryptoAvailableSupply(value: string) { this.set('crypto_available_supply', value); }

    public get CryptoTotalSupply(): string { return this.get('crypto_total_supply'); }
    public set CryptoTotalSupply(value: string) { this.set('crypto_total_supply', value); }

    public get CryptoMaxSupply(): string { return this.get('crypto_max_supply'); }
    public set CryptoMaxSupply(value: string) { this.set('crypto_max_supply', value); }

    public get CryptoPercentChange1H(): string { return this.get('crypto_percent_change_1_h'); }
    public set CryptoPercentChange1H(value: string) { this.set('crypto_percent_change_1_h', value); }

    public get CryptoPercentChange24H(): string { return this.get('crypto_percent_change_24_h'); }
    public set CryptoPercentChange24H(value: string) { this.set('crypto_percent_change_24_h', value); }

    public get CryptoPercentChange7D(): string { return this.get('crypto_percent_change_7_d'); }
    public set CryptoPercentChange7D(value: string) { this.set('crypto_percent_change_7_d', value); }

    public get CryptoLastUpdated(): string { return this.get('crypto_last_updated'); }
    public set CryptoLastUpdated(value: string) { this.set('crypto_last_updated', value); }

    public get CryptoPriceCurrency(): string { return this.get('crypto_price_currency'); }
    public set CryptoPriceCurrency(value: string) { this.set('crypto_price_currency', value); }

    public get Crypto24HVolumeCurrency(): string { return this.get('crypto_24_h_volume_currency'); }
    public set Crypto24HVolumeCurrency(value: string) { this.set('crypto_24_h_volume_currency', value); }

    public get CryptoMarketCapCurrency(): string { return this.get('crypto_market_cap_currency'); }
    public set CryptoMarketCapCurrency(value: string) { this.set('crypto_market_cap_currency', value); }
}
