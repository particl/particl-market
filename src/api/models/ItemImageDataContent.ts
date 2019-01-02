// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';


export class ItemImageDataContent extends Bookshelf.Model<ItemImageDataContent> {

    public static RELATIONS = [
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ItemImageDataContent> {
        if (withRelated) {
            return await ItemImageDataContent.where<ItemImageDataContent>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ItemImageDataContent.where<ItemImageDataContent>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'item_image_data_contents'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Data(): string { return this.get('data'); }
    public set Data(value: string) { this.set('data', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

}
