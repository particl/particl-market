import { Bookshelf } from '../../config/Database';


export class ItemCategory extends Bookshelf.Model<ItemCategory> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemCategory> {
        if (withRelated) {
            return await ItemCategory.where<ItemCategory>({ id: value }).fetch({
                withRelated: [
                    'ItemCategory'
                ]
            });
        } else {
            return await ItemCategory.where<ItemCategory>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_categories'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // ItemCategory can have a parent ItemCategory
    public ItemCategory(): ItemCategory {
        // model.hasOne(Target, [foreignKey], [foreignKeyTarget])
        return this.hasOne(ItemCategory, 'parent_item_category_id', 'id');
    }
}
