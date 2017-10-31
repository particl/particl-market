import { Bookshelf } from '../../config/Database';


export class ListingItemObject extends Bookshelf.Model<ListingItemObject> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItemObject> {
        if (withRelated) {
            return await ListingItemObject.where<ListingItemObject>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ListingItemObjectRelated',
                    // 'ListingItemObjectRelated.Related'
                ]
            });
        } else {
            return await ListingItemObject.where<ListingItemObject>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'listing_item_objects'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get Order(): number { return this.get('order'); }
    public set Order(value: number) { this.set('order', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public ListingItemObjectRelated(): ListingItemObjectRelated {
    //    return this.hasOne(ListingItemObjectRelated);
    // }
}
