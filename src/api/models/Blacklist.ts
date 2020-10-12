// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { BlacklistType } from '../enums/BlacklistType';
import { ListingItem } from './ListingItem';
import { Profile } from './Profile';
import { BlacklistSearchParams } from '../requests/search/BlacklistSearchParams';


export class Blacklist extends Bookshelf.Model<Blacklist> {

    public static RELATIONS = [
        'Profile'
    ];

    /**
     *
     * @param {BlacklistSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<Blacklist>>}
     */
    public static async searchBy(options: BlacklistSearchParams, withRelated: boolean = false): Promise<Collection<Blacklist>> {

        // this.log.debug('options: ', JSON.stringify(options, null, 2));

        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {

                if (options.type) {
                    qb.where('blacklists.category', '=', options.type.toString());
                }

                if (options.target) {
                    qb.where('blacklists.target', '=', options.target);
                }
                if (options.market) {
                    qb.where('blacklists.market', '=', options.market);
                }

                if (options.profileId) {
                    qb.where('blacklists.profile_id', '=', options.profileId);
                }
                if (options.listingItemId) {
                    qb.where('blacklists.listing_item_id', '=', options.listingItemId);
                }

                // qb.debug(true);

            })
            .orderBy('created_at', options.order);

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Blacklist> {
        return Blacklist.where<Blacklist>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByType(type: BlacklistType, withRelated: boolean = true): Promise<Collection<Blacklist>> {
        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('type', '=', type);
            });
        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByTypeAndProfileId(type: BlacklistType, profileId: number, withRelated: boolean = true): Promise<Collection<Blacklist>> {
        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('type', '=', type);
                qb.andWhere('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');
        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByTargetAndProfileId(target: string, profileId?: number, withRelated: boolean = true): Promise<Collection<Blacklist>> {
        const collection = Blacklist.forge<Model<Blacklist>>()
            .query(qb => {
                qb.where('target', '=', target);
                if (profileId) {
                    qb.andWhere('profile_id', '=', profileId);
                } else {
                    qb.whereNull('profile_id');
                }
            })
            .orderBy('id', 'ASC');
        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
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

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

}
