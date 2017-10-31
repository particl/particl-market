import { Bookshelf } from '../../config/Database';
import { LocationMarker } from './LocationMarker';

export class ItemLocation extends Bookshelf.Model<ItemLocation> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemLocation> {
        if (withRelated) {
            return await ItemLocation.where<ItemLocation>({ id: value }).fetch({
                withRelated: [
                    'LocationMarker'
                ]
            });
        } else {
            return await ItemLocation.where<ItemLocation>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_locations'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Region(): string { return this.get('region'); }
    public set Region(value: string) { this.set('region', value); }

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public LocationMarker(): LocationMarker {
        return this.hasOne(LocationMarker);
    }
}
