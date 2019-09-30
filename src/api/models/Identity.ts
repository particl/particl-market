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

    public get IdentitySpaddress(): string { return this.get('identity_spaddress'); }
    public set IdentitySpaddress(value: string) { this.set('identity_spaddress', value); }

    public get EscrowSpaddress(): string { return this.get('escrow_spaddress'); }
    public set EscrowSpaddress(value: string) { this.set('escrow_spaddress', value); }

    public get TxfeeSpaddress(): string { return this.get('txfee_spaddress'); }
    public set TxfeeSpaddress(value: string) { this.set('txfee_spaddress', value); }

    public get WalletHdseedid(): string { return this.get('wallet_hdseedid'); }
    public set WalletHdseedid(value: string) { this.set('wallet_hdseedid', value); }

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
