import { Bookshelf } from '../../config/Database';
import { ShippingDestinationSearchParams } from '../requests/ShippingDestinationSearchParams';
import { ItemInformation } from './ItemInformation';
export declare class ShippingDestination extends Bookshelf.Model<ShippingDestination> {
    static fetchById(value: number, withRelated?: boolean): Promise<ShippingDestination>;
    static searchBy(options: ShippingDestinationSearchParams): Promise<ShippingDestination>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Country: string;
    ShippingAvailability: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ItemInformation(): ItemInformation;
}
