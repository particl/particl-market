// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalResultRepository } from '../repositories/ProposalResultRepository';
import { ProposalResult } from '../models/ProposalResult';
import { ProposalResultCreateRequest } from '../requests/ProposalResultCreateRequest';
import { ProposalResultUpdateRequest } from '../requests/ProposalResultUpdateRequest';

export class ProposalResultService {

    public log: LoggerType;

    constructor(
        // @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Repository) @named(Targets.Repository.ProposalResultRepository) public proposalResultRepo: ProposalResultRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalResult>> {
        return this.proposalResultRepo.findAll();
    }

    public async findAllByProposalHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ProposalResult>> {
        return await this.proposalResultRepo.findAllByProposalHash(hash, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalResult> {
        const proposalResult = await this.proposalResultRepo.findOne(id, withRelated);
        if (proposalResult === null) {
            this.log.warn(`ProposalResult with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return proposalResult;
    }

    public async findLatestByProposalHash(hash: string, withRelated: boolean = true): Promise<ProposalResult> {
        const proposalResults = await this.proposalResultRepo.findAllByProposalHash(hash, withRelated);
        // this.log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));

        if (proposalResults === null) {
            this.log.warn(`ProposalResult with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return proposalResults.first();
    }

    @validate()
    public async create( @request(ProposalResultCreateRequest) data: ProposalResultCreateRequest): Promise<ProposalResult> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create ProposalResult, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the proposalResult
        const proposalResult = await this.proposalResultRepo.create(body);

        // finally find and return the created proposalResult
        const newProposalResult = await this.findOne(proposalResult.id);
        return newProposalResult;
    }

    @validate()
    public async update(id: number, @request(ProposalResultUpdateRequest) body: ProposalResultUpdateRequest): Promise<ProposalResult> {

        // find the existing one without related
        const proposalResult: any = await this.findOne(id, false);
        // proposalResult = proposalResult.toJSON();

        // set new values
        proposalResult.calculatedAt = body.calculatedAt;

        // update proposalResult record
        const updatedProposalResult = await this.proposalResultRepo.update(id, proposalResult.toJSON());

        // const newProposalResult = await this.findOne(id);
        // return newProposalResult;

        return updatedProposalResult;
    }

    public async destroy(id: number): Promise<void> {
        await this.proposalResultRepo.destroy(id);
    }

}
