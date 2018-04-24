import { Bookshelf } from '../../config/Database';
export declare class MessagingInformation extends Bookshelf.Model<MessagingInformation> {
    static fetchById(value: number, withRelated?: boolean): Promise<MessagingInformation>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Protocol: string;
    PublicKey: string;
    UpdatedAt: Date;
    CreatedAt: Date;
}
