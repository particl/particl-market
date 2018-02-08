import { Bookshelf } from '../../config/Database';
import { CurrencyPriceParams } from '../requests/CurrencyPriceParams';

export class CurrencyPrice extends Bookshelf.Model<CurrencyPrice> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<CurrencyPrice> {
        if (withRelated) {
            return await CurrencyPrice.where<CurrencyPrice>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'CurrencyPriceRelated',
                    // 'CurrencyPriceRelated.Related'
                ]
            });
        } else {
            return await CurrencyPrice.where<CurrencyPrice>({ id: value }).fetch();
        }
    }

    // find currency price by from currency and to currency
    public static async search(options: CurrencyPriceParams): Promise<CurrencyPrice> {
        return await CurrencyPrice.where<CurrencyPrice>({ from: options.from, to: options.to}).fetch();
    }

    public get tableName(): string { return 'currency_prices'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get From(): string { return this.get('from'); }
    public set From(value: string) { this.set('from', value); }

    public get To(): string { return this.get('to'); }
    public set To(value: string) { this.set('to', value); }

    public get Price(): number { return this.get('price'); }
    public set Price(value: number) { this.set('price', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public CurrencyPriceRelated(): CurrencyPriceRelated {
    //    return this.hasOne(CurrencyPriceRelated);
    // }
}
