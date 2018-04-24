import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemImageData } from './ItemImageData';
import { ItemInformation } from './ItemInformation';
export declare class ItemImage extends Bookshelf.Model<ItemImage> {
    static fetchById(value: number, withRelated?: boolean): Promise<ItemImage>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Hash: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ItemImageDatas(): Collection<ItemImageData>;
    ItemInformation(): ItemInformation;
}
