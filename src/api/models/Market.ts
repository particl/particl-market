import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ListingItem } from './ListingItem';


export class Market extends Bookshelf.Model<Market> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Market> {
        if (withRelated) {
            return await Market.where<Market>({ id: value }).fetch({
                withRelated: [
                ]
            });
        } else {
            return await Market.where<Market>({ id: value }).fetch();
        }
    }

    public static async fetchByAddress(value: string, withRelated: boolean = true): Promise<Market> {
        if (withRelated) {
            return await Market.where<Market>({ address: value }).fetch({
                withRelated: [
                ]
            });
        } else {
            return await Market.where<Market>({ address: value }).fetch();
        }
    }

    public static async fetchByName(value: string, withRelated: boolean = true): Promise<Market> {
        if (withRelated) {
            return await Market.where<Market>({ name: value }).fetch({
                withRelated: [
                ]
            });
        } else {
            return await Market.where<Market>({ name: value }).fetch();
        }
    }

    public get tableName(): string { return 'markets'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get PrivateKey(): string { return this.get('private_key'); }
    public set PrivateKey(value: string) { this.set('private_key', value); }

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
