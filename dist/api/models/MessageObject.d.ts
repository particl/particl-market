import { Bookshelf } from '../../config/Database';
import { ActionMessage } from './ActionMessage';
export declare class MessageObject extends Bookshelf.Model<MessageObject> {
    static RELATIONS: never[];
    static fetchById(value: number, withRelated?: boolean): Promise<MessageObject>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    DataId: string;
    DataValue: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ActionMessage(): ActionMessage;
}
