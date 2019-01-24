// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Vote } from '../models/Vote';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { ProposalResult } from '../models/ProposalResult';

export class VoteRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Vote) public VoteModel: typeof Vote,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Vote>> {
        const list = await this.VoteModel.fetchAll();
        return list as Bookshelf.Collection<Vote>;
    }

    public async findAllByProposalHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Vote>> {
        return await this.VoteModel.fetchByProposalHash(hash, withRelated);
    }

    public async findAllByVotersAndProposalHash(voters: string[], hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Vote>> {
        return await this.VoteModel.fetchByVotersAndProposalHash(voters, hash, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Vote> {
        return this.VoteModel.fetchById(id, withRelated);
    }

    public async findOneBySignature(signature: string, withRelated: boolean = true): Promise<Vote> {
        return this.VoteModel.fetchBySignature(signature, withRelated);
    }

    public async findOneByVoterAndProposalId(voter: string, proposalId: number, withRelated: boolean = true): Promise<Vote> {
        return this.VoteModel.fetchByVoterAndProposalId(voter, proposalId, withRelated);
    }

    public async create(data: any): Promise<Vote> {
        const vote = this.VoteModel.forge<Vote>(data);
        try {
            const voteCreated = await vote.save();
            return this.VoteModel.fetchById(voteCreated.id);
        } catch (error) {
            this.log.error('Could not create the vote! ' + error);
            throw new DatabaseException('Could not create the vote!' + error, error);
        }
    }

    public async update(id: number, data: any): Promise<Vote> {
        const vote = this.VoteModel.forge<Vote>({ id });
        try {
            const voteUpdated = await vote.save(data, { patch: true });
            return this.VoteModel.fetchById(voteUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the vote! ' + error, error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let vote = this.VoteModel.forge<Vote>({ id });
        try {
            vote = await vote.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await vote.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the vote! ' + error, error);
        }
    }

}
