// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ProposalOptionRepository } from '../../repositories/ProposalOptionRepository';
import { ProposalOption } from '../../models/ProposalOption';
import { ProposalOptionCreateRequest } from '../../requests/model/ProposalOptionCreateRequest';
import { ProposalOptionUpdateRequest } from '../../requests/model/ProposalOptionUpdateRequest';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class ProposalOptionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalOptionRepository) public proposalOptionRepo: ProposalOptionRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalOption>> {
        return this.proposalOptionRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalOption> {
        const proposalOption = await this.proposalOptionRepo.findOne(id, withRelated);
        if (proposalOption === null) {
            this.log.warn(`ProposalOption with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return proposalOption;
    }

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<ProposalOption> {
        const proposalOption = await this.proposalOptionRepo.findOneByHash(hash, withRelated);
        if (proposalOption === null) {
            this.log.warn(`ProposalOption with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return proposalOption;
    }

    public async findOneByProposalIdAndOptionId(proposalId: number, optionId: number, withRelated: boolean = true): Promise<ProposalOption> {
        const proposalOption = await this.proposalOptionRepo.findOneByProposalAndOptionId(proposalId, optionId, withRelated);
        if (proposalOption === null) {
            this.log.warn(`ProposalOption with the proposalId=${proposalId} and optionId=${optionId} was not found!`);
            throw new NotFoundException(proposalId);
        }
        return proposalOption;
    }

    @validate()
    public async create( @request(ProposalOptionCreateRequest) data: ProposalOptionCreateRequest): Promise<ProposalOption> {
        const body = JSON.parse(JSON.stringify(data));
        const proposalOption = await this.proposalOptionRepo.create(body);
        const result = await this.findOne(proposalOption.id, true);
        return result;
    }

    @validate()
    public async update(id: number, @request(ProposalOptionUpdateRequest) body: ProposalOptionUpdateRequest): Promise<ProposalOption> {
        // update not needed
        throw new NotImplementedException();

/*
        // find the existing one without related
        const proposalOption = await this.findOne(id, false);

        // set new values
        proposalOption.OptionId = body.optionId;
        proposalOption.Description = body.description;
        proposalOption.Hash = body.hash;

        // update proposalOption record
        const updatedProposalOption = await this.proposalOptionRepo.update(id, proposalOption.toJSON());

        // TODO: update the Proposal.hash
        // const newProposalOption = await this.findOne(id);
        // return newProposalOption;

        return updatedProposalOption;
*/
    }

    public async destroy(id: number): Promise<void> {
        await this.proposalOptionRepo.destroy(id);
    }

}
