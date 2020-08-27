// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { ItemImageData } from './ItemImageData';
import { ItemInformation } from './ItemInformation';

export class ItemImage extends Bookshelf.Model<ItemImage> {

    public static RELATIONS = [
        'ItemImageDatas',
        'ItemInformation',
        'ItemInformation.ListingItem',
        'ItemInformation.ListingItemTemplate'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemImage> {
        return ItemImage.where<ItemImage>({ id: value }).fetch(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    // fetchAll because multiple listings could be using the same image
    public static async fetchAllByHash(hash: string, withRelated: boolean = true): Promise<Collection<ItemImage>> {
        const collection = ItemImage.forge<Model<ItemImage>>()
            .query(qb => {
                qb.where('hash', '=', hash);
            });

        return collection.fetchAll(withRelated ? {withRelated: this.RELATIONS} : undefined);
    }

    public get tableName(): string { return 'item_images'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Featured(): boolean { return this.get('featured'); }
    public set Featured(value: boolean) { this.set('featured', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ItemImageDatas(): Collection<ItemImageData> {
        return this.hasMany(ItemImageData, 'item_image_id', 'id');
    }

    public ItemInformation(): ItemInformation {
        return this.belongsTo(ItemInformation, 'item_information_id', 'id');
    }
}
