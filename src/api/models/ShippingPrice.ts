import { Bookshelf } from '../../config/Database';


export class ShippingPrice extends Bookshelf.Model<ShippingPrice> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ShippingPrice> {
        if (withRelated) {
            return await ShippingPrice.where<ShippingPrice>({ id: value }).fetch({
                withRelated: [
                ]
            });
        } else {
            return await ShippingPrice.where<ShippingPrice>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'shipping_prices'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Domestic(): number { return this.get('domestic'); }
    public set Domestic(value: number) { this.set('domestic', value); }

    public get International(): number { return this.get('international'); }
    public set International(value: number) { this.set('international', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
