import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Address } from './Address';


export class Profile extends Bookshelf.Model<Profile> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Profile> {
        if (withRelated) {
            return await Profile.where<Profile>({ id: value }).fetch({
                withRelated: [
                    'Addresses'
                ]
            });
        } else {
            return await Profile.where<Profile>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'profile'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Addresses(): Collection<Address> {
        // model.hasMany(Target, [foreignKey], [foreignKeyTarget])
        return this.hasMany(Address , 'profile_id', 'id');
    }

    // TODO: add related
    // public ProfileRelated(): ProfileRelated {
    //    return this.hasOne(ProfileRelated);
    // }
}
