import { Bookshelf } from '../../config/Database';
import {ActionMessage} from './ActionMessage';


export class MessageValue extends Bookshelf.Model<MessageValue> {

    public static RELATIONS = [
        'ActionMessage'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessageValue> {
        if (withRelated) {
            return await MessageValue.where<MessageValue>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await MessageValue.where<MessageValue>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'message_values'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Key(): string { return this.get('key'); }
    public set Key(value: string) { this.set('key', value); }

    public get Value(): string { return this.get('value'); }
    public set Value(value: string) { this.set('value', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ActionMessage(): ActionMessage {
        return this.belongsTo(ActionMessage, 'action_message_id', 'id');
    }
}
