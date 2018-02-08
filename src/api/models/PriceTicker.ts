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

    public get CryptoPriceUsd(): string { return this.get('crypto_price_usd'); }
    public set CryptoPriceUsd(value: string) { this.set('crypto_price_usd', value); }

    public get CryptoPriceBtc(): string { return this.get('crypto_price_btc'); }
    public set CryptoPriceBtc(value: string) { this.set('crypto_price_btc', value); }

    public get CryptoPriceCurrency(): string { return this.get('crypto_price_currency'); }
    public set CryptoPriceCurrency(value: string) { this.set('crypto_price_currency', value); }

}
