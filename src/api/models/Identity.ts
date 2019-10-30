// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Profile } from './Profile';
import { Collection, Model } from 'bookshelf';
import { Market } from './Market';

export class Identity extends Bookshelf.Model<Identity> {

    public static RELATIONS = [
        'Markets',
        'Profile'
    ];

    public static async fetchAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Collection<Identity>> {
        const IdentityCollection = Identity.forge<Model<Identity>>()
            .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await IdentityCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await IdentityCollection.fetchAll();
        }
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Identity> {
        if (withRelated) {
            return await Identity.where<Identity>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Identity.where<Identity>({ id: value }).fetch();
        }
    }

    public static async fetchByWalletName(value: string, withRelated: boolean = true): Promise<Identity> {
        if (withRelated) {
            return await Identity.where<Identity>({ wallet: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Identity.where<Identity>({ wallet: value }).fetch();
        }
    }

    public get tableName(): string { return 'identities'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Wallet(): string { return this.get('wallet'); }
    public set Wallet(value: string) { this.set('wallet', value); }

    public get Address(): string { return this.get('address'); }
    public set Address(value: string) { this.set('address', value); }

    public get Hdseedid(): string { return this.get('hdseedid'); }
    public set Hdseedid(value: string) { this.set('hdseedid', value); }

    public get Path(): string { return this.get('path'); }
    public set Path(value: string) { this.set('path', value); }

    public get Mnemonic(): string { return this.get('mnemonic'); }
    public set Mnemonic(value: string) { this.set('mnemonic', value); }

    public get Passphrase(): string { return this.get('passphrase'); }
    public set Passphrase(value: string) { this.set('passphrase', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

    public Markets(): Collection<Market> {
        return this.hasMany(Market, 'identity_id', 'id');
    }

}
