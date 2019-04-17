// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { ProposalOption } from './ProposalOption';
import { ProposalResult } from './ProposalResult';
import { ProposalSearchParams } from '../requests/ProposalSearchParams';
import { FlaggedItem } from './FlaggedItem';

export class Proposal extends Bookshelf.Model<Proposal> {

    public static RELATIONS = [
        'ProposalOptions',
        // 'ProposalOptions.Votes',
        'ProposalResults',
        'ProposalResults.ProposalOptionResults',
        'ProposalResults.ProposalOptionResults.ProposalOption',
        'FlaggedItem'
    ];

    /**
     * list * 100 -> return all proposals which ended before 100
     * list 100 * -> return all proposals ending after 100
     * list 100 200 -> return all which are active and closed between 100 200
     *
     * @param {ProposalSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<Proposal>>}
     */
    public static async searchBy(options: ProposalSearchParams, withRelated: boolean = false): Promise<Collection<Proposal>> {

        const proposalCollection = Proposal.forge<Model<Proposal>>()
            .query(qb => {

                if (options.category) {
                    // searchBy all
                    qb.where('proposals.category', '=', options.category.toString());
                }

                if (typeof options.timeStart === 'number' && typeof options.timeEnd === 'string') {
                    // searchBy all ending after options.timeStart
                    qb.where('proposals.expired_at', '>', options.timeStart - 1);

                } else if (typeof options.timeStart === 'string' && typeof options.timeEnd === 'number') {
                    // searchBy all ending before options.timeEnd
                    qb.where('proposals.expired_at', '<', options.timeEnd + 1);

                } else if (typeof options.timeStart === 'number' && typeof options.timeEnd === 'number') {
                    // searchBy all ending after options.timeStart, starting before options.timeEnd
                    qb.where('proposals.time_start', '<', options.timeEnd + 1);
                    qb.where('proposals.expired_at', '>', options.timeStart - 1);
                }
                // qb.debug(true);

            })
            .orderBy('time_start', options.order);

        if (withRelated) {
            return await proposalCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await proposalCollection.fetchAll();
        }
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ id: value }).fetch();
        }
    }

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ hash: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ hash: value }).fetch();
        }
    }

    public static async fetchByMsgId(value: string, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ msgid: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ msgid: value }).fetch();
        }
    }

    public static async fetchByItemHash(value: string, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ item: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ item: value }).fetch();
        }
    }

    public get tableName(): string { return 'proposals'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Submitter(): string { return this.get('submitter'); }
    public set Submitter(value: string) { this.set('submitter', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Item(): string { return this.get('item'); }
    public set Item(value: string) { this.set('item', value); }

    public get Category(): string { return this.get('category'); }
    public set Category(value: string) { this.set('category', value); }

    public get Title(): string { return this.get('title'); }
    public set Title(value: string) { this.set('title', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get TimeStart(): Date { return this.get('timeStart'); }
    public set TimeStart(value: Date) { this.set('timeStart', value); }

    public get PostedAt(): number { return this.get('postedAt'); }
    public set PostedAt(value: number) { this.set('postedAt', value); }

    public get ExpiredAt(): number { return this.get('expiredAt'); }
    public set ExpiredAt(value: number) { this.set('expiredAt', value); }

    public get ReceivedAt(): number { return this.get('receivedAt'); }
    public set ReceivedAt(value: number) { this.set('receivedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public ProposalOptions(): Collection<ProposalOption> {
        return this.hasMany(ProposalOption, 'proposal_id', 'id');
    }

    public ProposalResults(): Collection<ProposalResult> {
        return this.hasMany(ProposalResult, 'proposal_id', 'id');
    }

    public FlaggedItem(): FlaggedItem {
        return this.hasOne(FlaggedItem);
    }

}
