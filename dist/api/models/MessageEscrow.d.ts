import { Bookshelf } from '../../config/Database';
import { ActionMessage } from './ActionMessage';
export declare class MessageEscrow extends Bookshelf.Model<MessageEscrow> {
    static RELATIONS: never[];
    static fetchById(value: number, withRelated?: boolean): Promise<MessageEscrow>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Type: string;
    Rawtx: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ActionMessage(): ActionMessage;
}
