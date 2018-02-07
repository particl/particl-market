import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemImageData } from './ItemImageData';
import { ItemInformation } from './ItemInformation';

export class ItemImage extends Bookshelf.Model<ItemImage> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemImage> {
        if (withRelated) {
            return await ItemImage.where<ItemImage>({ id: value }).fetch({
                withRelated: [
                    'ItemImageDatas',
                    'ItemInformation'
                ]
            });
        } else {
            return await ItemImage.where<ItemImage>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_images'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ItemImageDatas(): Collection<ItemImageData> {
        return this.hasMany(ItemImageData, 'item_image_id', 'id');
    }

    public ItemInformation(): ItemInformation {
        return this.belongsTo(ItemInformation, 'item_information_id', 'id');
    }

}
