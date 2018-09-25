// Copyright (c) 2017-2018, The Particl Market developers
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
        'ProposalResult',
        'FlaggedItem'
    ];

    /**
     * list * 100 -> return all proposals which ended before block 100
     * list 100 * -> return all proposals ending after block 100
     * list 100 200 -> return all which are active and closed between 100 200
     *
     * @param {ProposalSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<Proposal>>}
     */
    public static async searchBy(options: ProposalSearchParams, withRelated: boolean = false): Promise<Collection<Proposal>> {

        const proposalCollection = Proposal.forge<Model<Proposal>>()
            .query(qb => {

                if (options.type) {
                    // search all
                    qb.where('proposals.type', '=', options.type.toString());

                }

                if (typeof options.startBlock === 'number' && typeof options.endBlock === 'string') {
                    // search all ending after options.startBlock
                    qb.where('proposals.block_end', '>', options.startBlock - 1);

                } else if (typeof options.startBlock === 'string' && typeof options.endBlock === 'number') {
                    // search all ending before block
                    qb.where('proposals.block_end', '<', options.endBlock + 1);

                } else if (typeof options.startBlock === 'number' && typeof options.endBlock === 'number') {
                    // search all ending after startBlock, starting before endBlock
                    qb.where('proposals.block_start', '<', options.endBlock + 1);
                    qb.andWhere('proposals.block_end', '>', options.startBlock - 1);
                }

            })
            .orderBy('block_start', options.order);

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

    public get Submitter(): string { return this.get('submitter'); }
    public set Submitter(value: string) { this.set('submitter', value); }

    public get BlockStart(): number { return this.get('blockStart'); }
    public set BlockStart(value: number) { this.set('blockStart', value); }

    public get BlockEnd(): number { return this.get('blockEnd'); }
    public set BlockEnd(value: number) { this.set('blockEnd', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Item(): string { return this.get('item'); }
    public set Item(value: string) { this.set('item', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Title(): string { return this.get('title'); }
    public set Title(value: string) { this.set('title', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get ExpiryTime(): number { return this.get('expiryTime'); }
    public set ExpiryTime(value: number) { this.set('expiryTime', value); }

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

    public ProposalResult(): ProposalResult {
       return this.hasOne(ProposalResult);
    }

    public FlaggedItem(): FlaggedItem {
        return this.hasOne(FlaggedItem);
    }

}
