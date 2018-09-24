// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';


export class Setting extends Bookshelf.Model<Setting> {

    public static RELATIONS = [
        'Profile'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Setting> {
        if (withRelated) {
            return await Setting.where<Setting>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Setting.where<Setting>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'settings'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Key(): string { return this.get('key'); }
    public set Key(value: string) { this.set('key', value); }

    public get Value(): string { return this.get('value'); }
    public set Value(value: string) { this.set('value', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }
}
