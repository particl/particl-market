import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { MessageObject } from './MessageObject';
import { MessageInfo } from './MessageInfo';
import { MessageEscrow } from './MessageEscrow';
import { MessageData } from './MessageData';
import {ListingItem} from './ListingItem';

export class ActionMessage extends Bookshelf.Model<ActionMessage> {

    public static RELATIONS = [
        'ListingItem',
        'MessageObjects',
        'MessageInfo',
        'MessageEscrow',
        'MessageData'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ActionMessage> {
        if (withRelated) {
            return await ActionMessage.where<ActionMessage>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ActionMessage.where<ActionMessage>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'action_messages'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Action(): string { return this.get('action'); }
    public set Action(value: string) { this.set('action', value); }

    public get Nonce(): string { return this.get('nonce'); }
    public set Nonce(value: string) { this.set('nonce', value); }

    public get Accepted(): boolean { return this.get('accepted'); }
    public set Accepted(value: boolean) { this.set('accepted', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public MessageObjects(): Collection<MessageObject> {
        return this.hasMany(MessageObject, 'action_message_id', 'id');
    }

    public MessageInfo(): MessageInfo {
        return this.hasOne(MessageInfo);
    }

    public MessageEscrow(): MessageEscrow {
        return this.hasOne(MessageEscrow);
    }

    public MessageData(): MessageData {
        return this.hasOne(MessageData);
    }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }
}
