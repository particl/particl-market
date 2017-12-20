import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';


export class CryptocurrencyAddress extends Bookshelf.Model<CryptocurrencyAddress> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<CryptocurrencyAddress> {
        if (withRelated) {
            return await CryptocurrencyAddress.where<CryptocurrencyAddress>({ id: value }).fetch({
                withRelated: [
                    // 'Profile'
                ]
            });
        } else {
            return await CryptocurrencyAddress.where<CryptocurrencyAddress>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'cryptocurrency_addresses'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

}
