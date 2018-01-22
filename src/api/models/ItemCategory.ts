import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';

export class ItemCategory extends Bookshelf.Model<ItemCategory> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemCategory> {
        if (withRelated) {
            return await ItemCategory.where<ItemCategory>({ id: value }).fetch({
                withRelated: [
                    'ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory.ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
                    'ChildItemCategories'
                ]
            });
        } else {
            return await ItemCategory.where<ItemCategory>({ id: value }).fetch();
        }
    }

    public static async fetchByKey(key: string, withRelated: boolean = true): Promise<ItemCategory> {
        if (withRelated) {
            return await ItemCategory.where<ItemCategory>({ key }).fetch({
                withRelated: [
                    'ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory.ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
                    'ChildItemCategories'
                ]
            });
        } else {
            return await ItemCategory.where<ItemCategory>({ key }).fetch();
        }
    }

    public static async fetchRoot(): Promise<ItemCategory> {
        return await ItemCategory.where<ItemCategory>({ key: 'cat_ROOT' }).fetch({
            withRelated: [
                'ChildItemCategories',
                'ChildItemCategories.ChildItemCategories',
                'ChildItemCategories.ChildItemCategories.ChildItemCategories',
                'ChildItemCategories.ChildItemCategories.ChildItemCategories.ChildItemCategories'
            ]
        });
    }

    public static async fetchAllByName(name: string, withRelated: boolean = true): Promise<Collection<ItemCategory>> {
        const listingCollection = ItemCategory.forge<Collection<ItemCategory>>()
            .query(qb => {
                qb.where('name', 'LIKE', '%' + name + '%');
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await listingCollection.fetchAll({
                withRelated: [
                    'ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory.ParentItemCategory',
                    'ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
                    'ChildItemCategories'
                ]
            });
        } else {
            return await listingCollection.fetchAll();
        }
    }

    public static async fetchCategoryByNameAndParentID(categoryName: string, parentCategoryId: number | null): Promise<ItemCategory> {
        return await ItemCategory.where<ItemCategory>({ name: categoryName, parent_item_category_id: parentCategoryId }).fetch();
    }

    public get tableName(): string { return 'item_categories'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    // public get ParentItemCategoryId(): number { return this.get('parent_item_category_id'); }
    // public set ParentItemCategoryId(value: number) { this.set('parent_item_category_id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get Key(): string { return this.get('key'); }
    public set Key(value: string) { this.set('key', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // ItemCategory can haz a parent ItemCategory
    public ParentItemCategory(): ItemCategory {
        // model.hasOne(Target, [foreignKey], [foreignKeyTarget])
        // return this.hasOne(ItemCategory, 'parent_item_category_id', 'id');
        // model.belongsTo(Target, [foreignKey], [foreignKeyTarget])
        return this.belongsTo(ItemCategory, 'parent_item_category_id', 'id');
    }

    public ChildItemCategories(): Collection<ItemCategory> {
        // model.hasMany(Target, [foreignKey], [foreignKeyTarget])
        return this.hasMany(ItemCategory, 'parent_item_category_id', 'id');
    }
}
