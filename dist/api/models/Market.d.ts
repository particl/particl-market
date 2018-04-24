import { Bookshelf } from '../../config/Database';
export declare class Market extends Bookshelf.Model<Market> {
    static fetchById(value: number, withRelated?: boolean): Promise<Market>;
    static fetchByAddress(value: string, withRelated?: boolean): Promise<Market>;
    static fetchByName(value: string, withRelated?: boolean): Promise<Market>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Name: string;
    PrivateKey: string;
    Address: string;
    UpdatedAt: Date;
    CreatedAt: Date;
}
