import { Bookshelf } from '../../config/Database';
import { ShippingDestinationSearchParams } from '../requests/ShippingDestinationSearchParams';

export class ShippingDestination extends Bookshelf.Model<ShippingDestination> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ShippingDestination> {
        if (withRelated) {
            return await ShippingDestination.where<ShippingDestination>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ShippingDestinationRelated',
                    // 'ShippingDestinationRelated.Related'
                ]
            });
        } else {
            return await ShippingDestination.where<ShippingDestination>({ id: value }).fetch();
        }
    }

    public static async searchBy(options: ShippingDestinationSearchParams): Promise<ShippingDestination> {
        return await ShippingDestination.where<ShippingDestination>({
            country: options.country, shipping_availability: options.shippingAvailability, item_information_id: options.item_information_id}).fetch();

    }

    public get tableName(): string { return 'shipping_destinations'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Country(): string { return this.get('country'); }
    public set Country(value: string) { this.set('country', value); }

    public get ShippingAvailability(): string { return this.get('shippingAvailability'); }
    public set ShippingAvailability(value: string) { this.set('shippingAvailability', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public ShippingDestinationRelated(): ShippingDestinationRelated {
    //    return this.hasOne(ShippingDestinationRelated);
    // }
}
