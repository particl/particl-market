import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';


export class Address extends Bookshelf.Model<Address> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Address> {
        if (withRelated) {
            return await Address.where<Address>({ id: value }).fetch({
                // withRelated: [
                //    'Profile'
                // ]
            });
        } else {
            return await Address.where<Address>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'addresses'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Title(): string { return this.get('title'); }
    public set Title(value: string) { this.set('title', value); }

    public get AddressLine1(): string { return this.get('address_line1'); }
    public set AddressLine1(value: string) { this.set('address_line1', value); }

    public get AddressLine2(): string { return this.get('address_line2'); }
    public set AddressLine2(value: string) { this.set('address_line2', value); }

    public get City(): string { return this.get('city'); }
    public set City(value: string) { this.set('city', value); }

    public get Country(): string { return this.get('country'); }
    public set Country(value: string) { this.set('country', value); }

    public get zipCode(): number { return this.get('zip_code'); }
    public set zipCode(value: number) { this.set('zip_code', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

}
