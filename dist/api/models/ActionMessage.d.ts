import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { MessageObject } from './MessageObject';
import { MessageInfo } from './MessageInfo';
import { MessageEscrow } from './MessageEscrow';
import { MessageData } from './MessageData';
import { ListingItem } from './ListingItem';
export declare class ActionMessage extends Bookshelf.Model<ActionMessage> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<ActionMessage>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Action: string;
    Nonce: string;
    Accepted: boolean;
    UpdatedAt: Date;
    CreatedAt: Date;
    MessageObjects(): Collection<MessageObject>;
    MessageInfo(): MessageInfo;
    MessageEscrow(): MessageEscrow;
    MessageData(): MessageData;
    ListingItem(): ListingItem;
}
