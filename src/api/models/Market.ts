// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
import { Collection, Model } from 'bookshelf';
import { Identity } from './Identity';
import { FlaggedItem } from './FlaggedItem';
import { ItemImage } from './ItemImage';

export class Market extends Bookshelf.Model<Market> {

    public static RELATIONS = [
        'FlaggedItem',
        'Profile',
        'Identity',
        'Identity.ShoppingCarts',
        'Image'
    ];

    public static async fetchAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Collection<Market>> {
        const collection = Market.forge<Model<Market>>()
            .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    // different Profiles could have added the same Market
    public static async fetchAllByReceiveAddress(receiveAddress: string, withRelated: boolean = true): Promise<Collection<Market>> {
        const collection = Market.forge<Model<Market>>()
            .query(qb => {
                qb.where('receive_address', 'LIKE', receiveAddress);
            })
            .orderBy('id', 'ASC');
        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Market> {
        return Market.where<Market>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<Market> {
        return Market.where<Market>({ hash: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchByMsgId(value: string, withRelated: boolean = true): Promise<Market> {
        return Market.where<Market>({ msgid: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchByProfileIdAndReceiveAddress(profileId: number, receiveAddress: string, withRelated: boolean = true): Promise<Market> {
        return Market.where<Market>({ profile_id: profileId, receive_address: receiveAddress }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'markets'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Name(): string { return this.get('name'); }
    public set Name(value: string) { this.set('name', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    // todo: add description
    // todo: add image
    public get ReceiveKey(): string { return this.get('receiveKey'); }
    public set ReceiveKey(value: string) { this.set('receiveKey', value); }

    public get ReceiveAddress(): string { return this.get('receiveAddress'); }
    public set ReceiveAddress(value: string) { this.set('receiveAddress', value); }

    public get PublishKey(): string { return this.get('publishKey'); }
    public set PublishKey(value: string) { this.set('publishKey', value); }

    public get PublishAddress(): string { return this.get('publishAddress'); }
    public set PublishAddress(value: string) { this.set('publishAddress', value); }

    public get Removed(): boolean { return this.get('removed'); }
    public set Removed(value: boolean) { this.set('removed', value); }

    public get ExpiryTime(): number { return this.get('expiryTime'); }
    public set ExpiryTime(value: number) { this.set('expiryTime', value); }

    public get PostedAt(): number { return this.get('postedAt'); }
    public set PostedAt(value: number) { this.set('postedAt', value); }

    public get ExpiredAt(): number { return this.get('expiredAt'); }
    public set ExpiredAt(value: number) { this.set('expiredAt', value); }

    public get ReceivedAt(): number { return this.get('receivedAt'); }
    public set ReceivedAt(value: number) { this.set('receivedAt', value); }

    public get GeneratedAt(): number { return this.get('generatedAt'); }
    public set GeneratedAt(value: number) { this.set('generatedAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

    public Identity(): Identity {
        return this.belongsTo(Identity, 'identity_id', 'id');
    }

    public FlaggedItem(): FlaggedItem {
        return this.hasOne(FlaggedItem);
    }

    public Image(): ItemImage {
        return this.belongsTo(ItemImage, 'image_id', 'id');
    }

}
