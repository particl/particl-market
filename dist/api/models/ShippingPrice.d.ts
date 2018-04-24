import { Bookshelf } from '../../config/Database';
export declare class ShippingPrice extends Bookshelf.Model<ShippingPrice> {
    static fetchById(value: number, withRelated?: boolean): Promise<ShippingPrice>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Domestic: number;
    International: number;
    UpdatedAt: Date;
    CreatedAt: Date;
}
