import { Bookshelf } from '../../config/Database';


export class LocationMarker extends Bookshelf.Model<LocationMarker> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<LocationMarker> {
        if (withRelated) {
            return await LocationMarker.where<LocationMarker>({ id: value }).fetch({
                withRelated: []
            });
        } else {
            return await LocationMarker.where<LocationMarker>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'location_markers'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get MarkerTitle(): string { return this.get('markerTitle'); }
    public set MarkerTitle(value: string) { this.set('markerTitle', value); }

    public get MarkerText(): string { return this.get('markerText'); }
    public set MarkerText(value: string) { this.set('markerText', value); }

    public get Lat(): number { return this.get('lat'); }
    public set Lat(value: number) { this.set('lat', value); }

    public get Lng(): number { return this.get('lng'); }
    public set Lng(value: number) { this.set('lng', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
