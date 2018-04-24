import { Bookshelf } from '../../config/Database';
export declare class LocationMarker extends Bookshelf.Model<LocationMarker> {
    static fetchById(value: number, withRelated?: boolean): Promise<LocationMarker>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    MarkerTitle: string;
    MarkerText: string;
    Lat: number;
    Lng: number;
    UpdatedAt: Date;
    CreatedAt: Date;
}
