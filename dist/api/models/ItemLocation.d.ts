import { Bookshelf } from '../../config/Database';
import { LocationMarker } from './LocationMarker';
export declare class ItemLocation extends Bookshelf.Model<ItemLocation> {
    static fetchById(value: number, withRelated?: boolean): Promise<ItemLocation>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Region: string;
    Address: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    LocationMarker(): LocationMarker;
}
