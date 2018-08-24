import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { SmsgMessageSearchParams } from '../requests/SmsgMessageSearchParams';
import * as _ from 'lodash';

export class SmsgMessage extends Bookshelf.Model<SmsgMessage> {

    public static RELATIONS = [];

    public static async searchBy(options: SmsgMessageSearchParams, withRelated: boolean = false): Promise<Collection<SmsgMessage>> {

        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;

        const messageCollection = SmsgMessage.forge<Model<SmsgMessage>>()
            .query(qb => {

                if (!_.isEmpty(options.status)) {
                    qb.where('smsg_messages.status', '=', options.status.toString());
                }

                if (!_.isEmpty(options.types)) {
                    qb.whereIn('smsg_messages.type', options.types);
                }

                qb.where('smsg_messages.created_at', '<', Date.now() - options.age);

            })
            .orderBy(options.orderByColumn, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });

        if (withRelated) {
            return await messageCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await messageCollection.fetchAll();
        }
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<SmsgMessage> {
        if (withRelated) {
            return await SmsgMessage.where<SmsgMessage>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await SmsgMessage.where<SmsgMessage>({ id: value }).fetch();
        }
    }

    public static async fetchByMsgId(value: string, withRelated: boolean = true): Promise<SmsgMessage> {
        if (withRelated) {
            return await SmsgMessage.where<SmsgMessage>({ msgid: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await SmsgMessage.where<SmsgMessage>({ msgid: value }).fetch();
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

    public get Read(): boolean { return this.get('read'); }
    public set Read(value: boolean) { this.set('read', value); }

    public get Paid(): boolean { return this.get('paid'); }
    public set Paid(value: boolean) { this.set('paid', value); }

    public get Payloadsize(): number { return this.get('payloadsize'); }
    public set Payloadsize(value: number) { this.set('payloadsize', value); }

    public get Received(): number { return this.get('received'); }
    public set Received(value: number) { this.set('received', value); }

    public get Sent(): number { return this.get('sent'); }
    public set Sent(value: number) { this.set('sent', value); }

    public get Expiration(): number { return this.get('expiration'); }
    public set Expiration(value: number) { this.set('expiration', value); }

    public get Daysretention(): number { return this.get('daysretention'); }
    public set Daysretention(value: number) { this.set('daysretention', value); }

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

}
