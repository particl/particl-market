import { Bookshelf } from '../../config/Database';
import { CurrencyPriceParams } from '../requests/CurrencyPriceParams';
export declare class CurrencyPrice extends Bookshelf.Model<CurrencyPrice> {
    static fetchById(value: number, withRelated?: boolean): Promise<CurrencyPrice>;
    static search(options: CurrencyPriceParams): Promise<CurrencyPrice>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    From: string;
    To: string;
    Price: number;
    UpdatedAt: Date;
    CreatedAt: Date;
}
