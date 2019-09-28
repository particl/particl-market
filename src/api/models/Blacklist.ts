import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { BlacklistType } from '../enums/BlacklistType';


export class Blacklist extends Bookshelf.Model<Blacklist> {

    public static RELATIONS = [
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Blacklist> {
        if (withRelated) {
            return await Blacklist.where<Blacklist>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Blacklist.where<Blacklist>({ id: value }).fetch();
        }
    }

    public static async fetchAllByType(type: BlacklistType): Promise<Collection<Blacklist>> {
        const blacklistResultCollection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('blacklists.type', '=', type);
            });
        return await blacklistResultCollection.fetchAll();
    }

    public get tableName(): string { return 'blacklists'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
