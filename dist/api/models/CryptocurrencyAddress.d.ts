import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
export declare class CryptocurrencyAddress extends Bookshelf.Model<CryptocurrencyAddress> {
    static fetchById(value: number, withRelated?: boolean): Promise<CryptocurrencyAddress>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Type: string;
    Address: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    Profile(): Profile;
}
