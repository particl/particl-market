import { Bookshelf } from '../../config/Database';


export class MessageEscrow extends Bookshelf.Model<MessageEscrow> {

    public static RELATIONS = [];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessageEscrow> {
        if (withRelated) {
            return await MessageEscrow.where<MessageEscrow>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await MessageEscrow.where<MessageEscrow>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'message_escrows'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Rawtx(): string { return this.get('rawtx'); }
    public set Rawtx(value: string) { this.set('rawtx', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
