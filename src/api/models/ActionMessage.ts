import { Bookshelf } from '../../config/Database';


export class ActionMessage extends Bookshelf.Model<ActionMessage> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ActionMessage> {
        if (withRelated) {
            return await ActionMessage.where<ActionMessage>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ActionMessageRelated',
                    // 'ActionMessageRelated.Related'
                ]
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

    // TODO: add related
    // public ActionMessageRelated(): ActionMessageRelated {
    //    return this.hasOne(ActionMessageRelated);
    // }
}
