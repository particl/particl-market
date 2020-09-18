// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { BlacklistType } from '../enums/BlacklistType';
import { Profile } from './Profile';

export class Blacklist extends Bookshelf.Model<Blacklist> {

    public static RELATIONS = [
        'Profile'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Blacklist> {
        if (withRelated) {
            return await Blacklist.where<Blacklist>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Blacklist.where<Blacklist>({ id: value }).fetch();
        }
    }

    public static async fetchAllByType(type: BlacklistType): Promise<Collection<Blacklist>> {
        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('type', '=', type);
            });
        return await collection.fetchAll();
    }

    public static async fetchAllByTypeAndProfileId(type: BlacklistType, profileId: number, withRelated: boolean = true): Promise<Collection<Blacklist>> {
        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('type', '=', type);
                qb.andWhere('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await collection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await collection.fetchAll();
        }
    }

    public static async fetchAllByTargetAndProfileId(target: string, profileId: number, withRelated: boolean = true): Promise<Collection<Blacklist>> {
        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('target', '=', target);
                qb.andWhere('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await collection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await collection.fetchAll();
        }
    }

    public get tableName(): string { return 'blacklists'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Target(): string { return this.get('target'); }
    public set Target(value: string) { this.set('target', value); }

    public get Market(): string { return this.get('market'); }
    public set Market(value: string) { this.set('market', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

}
