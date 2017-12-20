import { Bookshelf } from '../../config/Database';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';
import { ShippingPrice } from './ShippingPrice';

export class ItemPrice extends Bookshelf.Model<ItemPrice> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemPrice> {
        if (withRelated) {
            return await ItemPrice.where<ItemPrice>({ id: value }).fetch({
                withRelated: [
                    'ShippingPrice',
                    'CryptocurrencyAddress'
                ]
            });
        } else {
            return await ItemPrice.where<ItemPrice>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_prices'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Currency(): string { return this.get('currency'); }
    public set Currency(value: string) { this.set('currency', value); }

    public get BasePrice(): number { return this.get('basePrice'); }
    public set BasePrice(value: number) { this.set('basePrice', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ShippingPrice(): ShippingPrice {
        return this.hasOne(ShippingPrice);
    }

    public CryptocurrencyAddress(): CryptocurrencyAddress {
        return this.belongsTo(CryptocurrencyAddress, 'cryptocurrency_address_id', 'id');
    }

}
