// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { VoteRepository } from '../repositories/VoteRepository';
import { Vote } from '../models/Vote';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { VoteUpdateRequest } from '../requests/VoteUpdateRequest';

export class VoteService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.VoteRepository) public voteRepo: VoteRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Vote>> {
        return this.voteRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Vote> {
        const vote = await this.voteRepo.findOne(id, withRelated);
        if (vote === null) {
            this.log.warn(`Vote with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return vote;
    }

    public async findOneByVoterAndProposal(voter: string, proposalId: number, withRelated: boolean = true): Promise<Vote> {
        const vote = await this.voteRepo.findOneByVoterAndProposal(voter, proposalId, withRelated);
        if (!vote) {
            this.log.warn(`Vote with the voter=${voter} and proposalId=${proposalId} was not found!`);
            throw new NotFoundException(proposalId);
        }
        return vote;
    }

    @validate()
    public async create( @request(VoteCreateRequest) data: VoteCreateRequest): Promise<Vote> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Vote, body: ', JSON.stringify(body, null, 2));

        const vote = await this.voteRepo.create(body);

        // finally find and return the created vote
        const newVote = await this.findOne(vote.id);
        return newVote;
    }

    @validate()
    public async update(id: number, @request(VoteUpdateRequest) body: VoteUpdateRequest): Promise<Vote> {

        // find the existing one without related
        const vote = await this.findOne(id, false);

        // set new values
        vote.set('voter', body.voter);
        vote.set('block', body.block);
        vote.set('weight', body.weight);
        vote.set('proposalOptionId', body.proposal_option_id);

        // update vote record
        const updatedVote = await this.voteRepo.update(id, vote.toJSON());
        return updatedVote;
    }

    public async destroy(id: number): Promise<void> {
        await this.voteRepo.destroy(id);
    }

}
