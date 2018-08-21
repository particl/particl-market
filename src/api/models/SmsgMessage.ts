import { Bookshelf } from '../../config/Database';


export class SmsgMessage extends Bookshelf.Model<SmsgMessage> {

    public static RELATIONS = [
        // TODO:
        // 'SmsgMessageRelated',
        // 'SmsgMessageRelated.Related'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<SmsgMessage> {
        if (withRelated) {
            return await SmsgMessage.where<SmsgMessage>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await SmsgMessage.where<SmsgMessage>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'smsg_messages'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Status(): string { return this.get('status'); }
    public set Status(value: string) { this.set('status', value); }

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Version(): string { return this.get('version'); }
    public set Version(value: string) { this.set('version', value); }

    public get Received(): Date { return this.get('received'); }
    public set Received(value: Date) { this.set('received', value); }

    public get Sent(): Date { return this.get('sent'); }
    public set Sent(value: Date) { this.set('sent', value); }

    public get Expiration(): Date { return this.get('expiration'); }
    public set Expiration(value: Date) { this.set('expiration', value); }

    public get DaysRetention(): number { return this.get('daysRetention'); }
    public set DaysRetention(value: number) { this.set('daysRetention', value); }

    public get From(): string { return this.get('from'); }
    public set From(value: string) { this.set('from', value); }

    public get To(): string { return this.get('to'); }
    public set To(value: string) { this.set('to', value); }

    public get Text(): string { return this.get('text'); }
    public set Text(value: string) { this.set('text', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public SmsgMessageRelated(): SmsgMessageRelated {
    //    return this.hasOne(SmsgMessageRelated);
    // }
}
