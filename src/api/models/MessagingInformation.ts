import { Bookshelf } from '../../config/Database';


export class MessagingInformation extends Bookshelf.Model<MessagingInformation> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessagingInformation> {
        if (withRelated) {
            return await MessagingInformation.where<MessagingInformation>({ id: value }).fetch({
                withRelated: [
                ]
            });
        } else {
            return await MessagingInformation.where<MessagingInformation>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'messaging_informations'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Protocol(): string { return this.get('protocol'); }
    public set Protocol(value: string) { this.set('protocol', value); }

    public get PublicKey(): string { return this.get('publicKey'); }
    public set PublicKey(value: string) { this.set('publicKey', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
