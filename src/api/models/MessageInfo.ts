import { Bookshelf } from '../../config/Database';


export class MessageInfo extends Bookshelf.Model<MessageInfo> {

    public static RELATIONS = [];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessageInfo> {
        if (withRelated) {
            return await MessageInfo.where<MessageInfo>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await MessageInfo.where<MessageInfo>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'message_infos'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get Memo(): string { return this.get('memo'); }
    public set Memo(value: string) { this.set('memo', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
