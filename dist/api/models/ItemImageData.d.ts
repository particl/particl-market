import { Bookshelf } from '../../config/Database';
import { ItemImage } from './ItemImage';
export declare class ItemImageData extends Bookshelf.Model<ItemImageData> {
    static fetchById(value: number, withRelated?: boolean): Promise<ItemImageData>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Protocol: string;
    Encoding: string;
    ImageVersion: string;
    DataId: string;
    Data: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    OriginalMime: string;
    OriginalName: string;
    ItemImage(): ItemImage;
}
