import { Bookshelf } from '../../config/Database';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';
import { ShippingPrice } from './ShippingPrice';
export declare class ItemPrice extends Bookshelf.Model<ItemPrice> {
    static fetchById(value: number, withRelated?: boolean): Promise<ItemPrice>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Currency: string;
    BasePrice: number;
    UpdatedAt: Date;
    CreatedAt: Date;
    ShippingPrice(): ShippingPrice;
    CryptocurrencyAddress(): CryptocurrencyAddress;
}
