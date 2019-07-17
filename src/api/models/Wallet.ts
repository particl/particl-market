import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
import { Collection, Model } from 'bookshelf';
import { Market } from './Market';


export class Wallet extends Bookshelf.Model<Wallet> {

    public static RELATIONS = [
        'Markets',
        'Profile'
    ];

    public static async fetchAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Collection<Wallet>> {
        const WalletCollection = Wallet.forge<Model<Wallet>>()
            .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await WalletCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await WalletCollection.fetchAll();
        }
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Wallet> {
        if (withRelated) {
            return await Wallet.where<Wallet>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Wallet.where<Wallet>({ id: value }).fetch();
        }
    }

    public static async fetchByName(value: string, withRelated: boolean = true): Promise<Wallet> {
        if (withRelated) {
            return await Wallet.where<Wallet>({ name: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Wallet.where<Wallet>({ name: value }).fetch();
        }
    }

    public get tableName(): string { return 'wallets'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

    public Markets(): Collection<Market> {
        return this.hasMany(Market, 'profile_id', 'id');
    }

}
