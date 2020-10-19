// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { ImageData } from './ImageData';
import { ItemInformation } from './ItemInformation';
import { Identity } from './Identity';
import { Profile } from './Profile';
import { Market } from './Market';


export class Image extends Bookshelf.Model<Image> {

    public static RELATIONS = [
        'ImageDatas',
        'ItemInformation',
        'ItemInformation.ListingItem',
        'ItemInformation.ListingItemTemplate',
        'Identity',
        'Profile',
        'Market'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Image> {
        return Image.where<Image>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByHash(hash: string, withRelated: boolean = true): Promise<Collection<Image>> {
        const collection = Image.forge<Model<Image>>()
            .query(qb => {
                qb.where('hash', '=', hash);
            });

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByTarget(target: string, withRelated: boolean = true): Promise<Collection<Image>> {
        const collection = Image.forge<Model<Image>>()
            .query(qb => {
                qb.where('target', '=', target);
            });

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public static async fetchAllByHashAndTarget(hash: string, target: string, withRelated: boolean = true): Promise<Collection<Image>> {
        const collection = Image.forge<Model<Image>>()
            .query(qb => {
                qb.where('hash', '=', hash);
                qb.andWhere('target', '=', target);
            });

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'images'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Target(): string { return this.get('target'); }
    public set Target(value: string) { this.set('target', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Featured(): boolean { return this.get('featured'); }
    public set Featured(value: boolean) { this.set('featured', value); }

    public get GeneratedAt(): number { return this.get('generatedAt'); }
    public set GeneratedAt(value: number) { this.set('generatedAt', value); }

    public get PostedAt(): number { return this.get('postedAt'); }
    public set PostedAt(value: number) { this.set('postedAt', value); }

    public get ReceivedAt(): number { return this.get('receivedAt'); }
    public set ReceivedAt(value: number) { this.set('receivedAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ImageDatas(): Collection<ImageData> {
        return this.hasMany(ImageData, 'image_id', 'id');
    }

    public ItemInformation(): ItemInformation {
        return this.belongsTo(ItemInformation, 'item_information_id', 'id');
    }

    public Identity(): Identity {
        return this.hasOne(Identity);
    }

    public Profile(): Profile {
        return this.hasOne(Profile);
    }

    public Market(): Market {
        return this.hasOne(Market);
    }

}
