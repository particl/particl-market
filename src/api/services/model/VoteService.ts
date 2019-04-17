// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { VoteRepository } from '../../repositories/VoteRepository';
import { Vote } from '../../models/Vote';
import { VoteCreateRequest } from '../../requests/model/VoteCreateRequest';
import { VoteUpdateRequest } from '../../requests/model/VoteUpdateRequest';
import { CoreRpcService } from '../CoreRpcService';
import {SmsgMessage} from '../../models/SmsgMessage';

export class VoteService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.VoteRepository) public voteRepo: VoteRepository,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Vote>> {
        return this.voteRepo.findAll();
    }

    public async findAllByProposalHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Vote>> {
        return await this.voteRepo.findAllByProposalHash(hash, withRelated);
    }

    public async findAllByVotersAndProposalHash(voters: string[], proposalHash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Vote>> {
        return await this.voteRepo.findAllByVotersAndProposalHash(voters, proposalHash, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Vote> {
        const vote = await this.voteRepo.findOne(id, withRelated);
        if (vote === null) {
            this.log.warn(`Vote with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return vote;
    }

    public async findOneBySignature(signature: string, withRelated: boolean = true): Promise<Vote> {
        const vote = await this.voteRepo.findOneBySignature(signature, withRelated);
        if (vote === null) {
            this.log.warn(`Vote with the signature=${signature} was not found!`);
            throw new NotFoundException(signature);
        }
        return vote;
    }

    public async findOneByMsgId(msgId: string, withRelated: boolean = true): Promise<Vote> {
        const smsgMessage = await this.voteRepo.findOneByMsgId(msgId, withRelated);
        if (smsgMessage === null) {
            this.log.warn(`Vote with the msgid=${msgId} was not found!`);
            throw new NotFoundException(msgId);
        }
        return smsgMessage;
    }

    public async findOneByVoterAndProposalId(voter: string, proposalId: number, withRelated: boolean = true): Promise<Vote> {
        const vote = await this.voteRepo.findOneByVoterAndProposalId(voter, proposalId, withRelated);
        if (!vote) {
            this.log.warn(`Vote with the voter=${voter} and proposalId=${proposalId} was not found!`);
            throw new NotFoundException(voter + ' and ' + proposalId);
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
        vote.set('signature', body.signature);
        vote.set('voter', body.voter);
        vote.set('weight', body.weight);

        vote.set('postedAt', body.postedAt);
        vote.set('receivedAt', body.receivedAt);
        vote.set('expiredAt', body.expiredAt);

        vote.set('proposalOptionId', body.proposal_option_id);

        // update vote record
        const updatedVote = await this.voteRepo.update(id, vote.toJSON());
        return updatedVote;
    }

    public async destroy(id: number): Promise<void> {
        await this.voteRepo.destroy(id);
    }

}
