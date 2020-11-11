import * as _ from 'lodash';
import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { Profile } from './Profile';
import { SearchOrder } from '../enums/SearchOrder';
import { NotificationSearchOrderField } from '../enums/SearchOrderField';
import { NotificationSearchParams } from '../requests/search/NotificationSearchParams';


export class Notification extends Bookshelf.Model<Notification> {

    public static RELATIONS = [
        'Profile'
    ];

    public static async fetchAllByProfileId(value: number | undefined, withRelated: boolean = true): Promise<Collection<Notification>> {
        const collection = Notification.forge<Model<Notification>>()
            .query(qb => {
                if (value) {
                    qb.where('profile_id', '=', value);
                } else {
                    qb.whereNull('profile_id');
                }
            })
            .orderBy('id', 'ASC');

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Notification> {
        return Notification.where<Notification>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async searchBy(options: NotificationSearchParams, withRelated: boolean = true): Promise<Collection<Notification>> {

        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || NotificationSearchOrderField.UPDATED_AT;

        const collection = Notification.forge<Model<Notification>>()
            .query( qb => {

                if (options.profileId) {
                    qb.where('profile_id', '=', options.profileId);
                }

                if (!_.isNil(options.read)) {
                    qb.where('read', '=', options.read);
                }

            })
            .orderBy(options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'notifications'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get ObjectId(): number { return this.get('objectId'); }
    public set ObjectId(value: number) { this.set('objectId', value); }

    public get ObjectHash(): string { return this.get('objectHash'); }
    public set ObjectHash(value: string) { this.set('objectHash', value); }

    public get ParentObjectId(): number { return this.get('parentObjectId'); }
    public set ParentObjectId(value: number) { this.set('parentObjectId', value); }

    public get ParentObjectHash(): string { return this.get('parentObjectHash'); }
    public set ParentObjectHash(value: string) { this.set('parentObjectHash', value); }

    public get Target(): string { return this.get('target'); }
    public set Target(value: string) { this.set('target', value); }

    public get From(): string { return this.get('from'); }
    public set From(value: string) { this.set('from', value); }

    public get To(): string { return this.get('to'); }
    public set To(value: string) { this.set('to', value); }

    public get Market(): string { return this.get('market'); }
    public set Market(value: string) { this.set('market', value); }

    public get Category(): string { return this.get('category'); }
    public set Category(value: string) { this.set('category', value); }

    public get Read(): boolean { return this.get('read'); }
    public set Read(value: boolean) { this.set('read', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

}
