import { Bookshelf } from '../../config/Database';
import { ActionMessage } from './ActionMessage';
export declare class MessageInfo extends Bookshelf.Model<MessageInfo> {
    static RELATIONS: never[];
    static fetchById(value: number, withRelated?: boolean): Promise<MessageInfo>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Address: string;
    Memo: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ActionMessage(): ActionMessage;
}
