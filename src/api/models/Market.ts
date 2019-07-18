// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
import { Collection, Model } from 'bookshelf';

export class Market extends Bookshelf.Model<Market> {

    public static RELATIONS = [
        'Profile'
    ];

    public static async fetchAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Collection<Market>> {
        const MarketCollection = Market.forge<Model<Market>>()
            .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await MarketCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await MarketCollection.fetchAll();
        }
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Market> {
        if (withRelated) {
            return await Market.where<Market>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Market.where<Market>({ id: value }).fetch();
        }
    }

    public static async fetchByProfileIdAndReceiveAddress(profileId: number, receiveAddress: string, withRelated: boolean = true): Promise<Market> {
        if (withRelated) {
            return await Market.where<Market>({ profile_id: profileId, receive_address: receiveAddress }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Market.where<Market>({
                profile_id: profileId,
                receive_address: receiveAddress
            }).fetch();
        }
    }

    public static async fetchByProfileIdAndName(profileId: number, name: string, withRelated: boolean = true): Promise<Market> {
        if (withRelated) {
            return await Market.where<Market>({ profile_id: profileId, name }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Market.where<Market>({ profile_id: profileId, name }).fetch();
        }
    }

    public get tableName(): string { return 'markets'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get ReceiveKey(): string { return this.get('receiveKey'); }
    public set ReceiveKey(value: string) { this.set('receiveKey', value); }

    public get ReceiveAddress(): string { return this.get('receiveAddress'); }
    public set ReceiveAddress(value: string) { this.set('receiveAddress', value); }

    public get PublishKey(): string { return this.get('publishKey'); }
    public set PublishKey(value: string) { this.set('publishKey', value); }

    public get PublishAddress(): string { return this.get('publishAddress'); }
    public set PublishAddress(value: string) { this.set('publishAddress', value); }

    public get Wallet(): string { return this.get('wallet'); }
    public set Wallet(value: string) { this.set('wallet', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }
}
