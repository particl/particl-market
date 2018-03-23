import { Bookshelf } from '../../config/Database';


export class MessageObject extends Bookshelf.Model<MessageObject> {

    public static RELATIONS = [];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessageObject> {
        if (withRelated) {
            return await MessageObject.where<MessageObject>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await MessageObject.where<MessageObject>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'message_objects'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get DataId(): string { return this.get('dataId'); }
    public set DataId(value: string) { this.set('dataId', value); }

    public get DataValue(): string { return this.get('dataValue'); }
    public set DataValue(value: string) { this.set('dataValue', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
