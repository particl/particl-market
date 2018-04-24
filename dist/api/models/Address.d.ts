import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
export declare class Address extends Bookshelf.Model<Address> {
    static fetchById(value: number, withRelated?: boolean): Promise<Address>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    FirstName: string;
    LastName: string;
    Title: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    Country: string;
    ZipCode: string;
    Type: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    Profile(): Profile;
}
