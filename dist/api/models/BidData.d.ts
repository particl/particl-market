import { Bookshelf } from '../../config/Database';
export declare class BidData extends Bookshelf.Model<BidData> {
    static fetchById(value: number, withRelated?: boolean): Promise<BidData>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    DataValue: string;
    DataId: string;
    UpdatedAt: Date;
    CreatedAt: Date;
}
