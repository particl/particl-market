import { Bookshelf } from '../../config/Database';


export class ItemImageData extends Bookshelf.Model<ItemImageData> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemImageData> {
        if (withRelated) {
            return await ItemImageData.where<ItemImageData>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ItemImageDataRelated',
                    // 'ItemImageDataRelated.Related'
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

    public get DataId(): string { return this.get('dataId'); }
    public set DataId(value: string) { this.set('dataId', value); }

    public get Protocol(): string { return this.get('protocol'); }
    public set Protocol(value: string) { this.set('protocol', value); }

    public get Encoding(): string { return this.get('encoding'); }
    public set Encoding(value: string) { this.set('encoding', value); }

    public get DataBig(): string { return this.get('dataBig'); }
    public set DataBig(value: string) { this.set('dataBig', value); }

    public get DataMedium(): string { return this.get('dataMedium'); }
    public set DataMedium(value: string) { this.set('dataMedium', value); }

    public get DataThumbnail(): string { return this.get('dataThumbnail'); }
    public set DataThumbnail(value: string) { this.set('dataThumbnail', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public ItemImageDataRelated(): ItemImageDataRelated {
    //    return this.hasOne(ItemImageDataRelated);
    // }
}
