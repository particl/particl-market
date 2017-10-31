import { Bookshelf } from '../../config/Database';


export class ItemInformation extends Bookshelf.Model<ItemInformation> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemInformation> {
        if (withRelated) {
            return await ItemInformation.where<ItemInformation>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ItemInformationRelated',
                    // 'ItemInformationRelated.Related'
                ]
            });
        } else {
            return await ItemInformation.where<ItemInformation>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_informations'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Title(): string { return this.get('title'); }
    public set Title(value: string) { this.set('title', value); }

    public get ShortDescription(): string { return this.get('shortDescription'); }
    public set ShortDescription(value: string) { this.set('shortDescription', value); }

    public get LongDescription(): string { return this.get('longDescription'); }
    public set LongDescription(value: string) { this.set('longDescription', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public ItemInformationRelated(): ItemInformationRelated {
    //    return this.hasOne(ItemInformationRelated);
    // }
}
