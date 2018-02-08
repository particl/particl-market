import { Bookshelf } from '../../config/Database';
import { ItemImage } from './ItemImage';

export class ItemImageData extends Bookshelf.Model<ItemImageData> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemImageData> {
        if (withRelated) {
            return await ItemImageData.where<ItemImageData>({ id: value }).fetch({
                withRelated: [
                ]
            });
        } else {
            return await ItemImageData.where<ItemImageData>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_image_datas'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Protocol(): string { return this.get('protocol'); }
    public set Protocol(value: string) { this.set('protocol', value); }

    public get Encoding(): string { return this.get('encoding'); }
    public set Encoding(value: string) { this.set('encoding', value); }

    public get ImageVersion(): string { return this.get('imageVersion'); }
    public set ImageVersion(value: string) { this.set('imageVersion', value); }

    public get DataId(): string { return this.get('dataId'); }
    public set DataId(value: string) { this.set('dataId', value); }

    public get Data(): string { return this.get('data'); }
    public set Data(value: string) { this.set('data', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ItemImage(): ItemImage {
        return this.belongsTo(ItemImage, 'item_image_id', 'id');
    }
}
