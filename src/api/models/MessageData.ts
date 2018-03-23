import { Bookshelf } from '../../config/Database';


export class MessageData extends Bookshelf.Model<MessageData> {

    public static RELATIONS = [];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessageData> {
        if (withRelated) {
            return await MessageData.where<MessageData>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await MessageData.where<MessageData>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'message_datas'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Version(): string { return this.get('version'); }
    public set Version(value: string) { this.set('version', value); }

    public get Received(): Date { return this.get('received'); }
    public set Received(value: Date) { this.set('received', value); }

    public get Sent(): Date { return this.get('sent'); }
    public set Sent(value: Date) { this.set('sent', value); }

    public get From(): string { return this.get('from'); }
    public set From(value: string) { this.set('from', value); }

    public get To(): string { return this.get('to'); }
    public set To(value: string) { this.set('to', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
