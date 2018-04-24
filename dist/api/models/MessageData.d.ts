import { Bookshelf } from '../../config/Database';
import { ActionMessage } from './ActionMessage';
export declare class MessageData extends Bookshelf.Model<MessageData> {
    static RELATIONS: never[];
    static fetchById(value: number, withRelated?: boolean): Promise<MessageData>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Msgid: string;
    Version: string;
    Received: Date;
    Sent: Date;
    From: string;
    To: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ActionMessage(): ActionMessage;
}
