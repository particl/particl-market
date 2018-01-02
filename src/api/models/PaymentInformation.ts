import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Escrow } from './Escrow';
import { ItemPrice } from './ItemPrice';
import { CryptocurrencyAddress } from './CryptocurrencyAddress';

export class PaymentInformation extends Bookshelf.Model<PaymentInformation> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<PaymentInformation> {
        if (withRelated) {
            return await PaymentInformation.where<PaymentInformation>({ id: value }).fetch({
                withRelated: [
                    'Escrow',
                    'Escrow.Ratio',
                    'ItemPrice',
                    'ItemPrice.ShippingPrice',
                    'ItemPrice.CryptocurrencyAddress'
                ]
            });
        } else {
            return await PaymentInformation.where<PaymentInformation>({ id: value }).fetch();
        }
    }

    public static async fetchByListingItemTemplateId(value: number): Promise<PaymentInformation> {
        return await PaymentInformation.where<PaymentInformation>({ listing_item_template_id: value }).fetch();
    }

    public get tableName(): string { return 'payment_informations'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    // public get ListingItemTemplateId(): number { return this.get('listing_item_template_id'); }
    // public set ListingItemTemplateId(value: number) { this.set('listing_item_template_id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Escrow(): Escrow {
        return this.hasOne(Escrow);
    }

    public ItemPrice(): ItemPrice {
        return this.hasOne(ItemPrice);
    }

}
