// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../enums/HashableObjectType';
import { ProposalOptionService } from './ProposalOptionService';
import { ProposalSearchParams } from '../requests/ProposalSearchParams';

export class ProposalService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepo: ProposalRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async searchBy(options: ProposalSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<Proposal>> {
        const result = await this.proposalRepo.searchBy(options, withRelated);
        // this.log.debug('searchBy, result: ', JSON.stringify(result.toJSON(), null, 2));
        return result;
    }

    public async findAll(withRelated: boolean = true): Promise<Bookshelf.Collection<Proposal>> {
        return this.proposalRepo.findAll(withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Proposal> {
        const proposal = await this.proposalRepo.findOne(id, withRelated);
        if (proposal === null) {
            this.log.warn(`Proposal with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return proposal;
    }

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Proposal> {
        const proposal = await this.proposalRepo.findOneByHash(hash, withRelated);
        if (proposal === null) {
            this.log.warn(`Proposal with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return proposal;
    }

    public async findOneByItemHash(listingItemHash: string, withRelated: boolean = true): Promise<Proposal> {
        const proposal = await this.proposalRepo.findOneByItemHash(listingItemHash, withRelated);
        if (proposal === null) {
            this.log.warn(`Proposal with the listingItemHash=${listingItemHash} was not found!`);
            throw new NotFoundException(listingItemHash);
        }
        return proposal;
    }

    @validate()
    public async create( @request(ProposalCreateRequest) data: ProposalCreateRequest, skipOptions: boolean = false): Promise<Proposal> {
        const startTime = new Date().getTime();

        const body = JSON.parse(JSON.stringify(data));
        this.log.debug('create Proposal, body: ', JSON.stringify(body, null, 2));

        body.hash = ObjectHash.getHash(body, HashableObjectType.PROPOSAL_CREATEREQUEST);

        // extract and remove related models from request
        const options = body.options || [];
        delete body.options;


        // if the request body was valid we will create the proposal
        const proposal = await this.proposalRepo.create(body);

        this.log.debug('proposal DONE');

        // TODO: remove skipOptions
        // skipOptions is just for tests
        if (!skipOptions) {
            let optionId = 0;
            // create related options
            for (const optionCreateRequest of options) {
                optionCreateRequest.proposal_id = proposal.id;
                optionCreateRequest.proposalHash = body.hash;

                if (!optionCreateRequest.optionId) {
                    optionCreateRequest.optionId = optionId;
                    optionId++;
                }
                // this.log.debug('optionCreateRequest: ', JSON.stringify(optionCreateRequest, null, 2));
                await this.proposalOptionService.create(optionCreateRequest);
            }
        } else {
            this.log.debug('skipping creation of ProposalOptions...');
        }

        // finally find and return the created proposal
        const result = await this.findOne(proposal.id, true);

        this.log.debug('ProposalService.create: ' + (new Date().getTime() - startTime) + 'ms');

        return result;
    }

    @validate()
    public async update(id: number, @request(ProposalUpdateRequest) data: ProposalUpdateRequest): Promise<Proposal> {

        const body = JSON.parse(JSON.stringify(data));
        body.hash = ObjectHash.getHash(body, HashableObjectType.PROPOSAL_CREATEREQUEST);

        // find the existing one without related
        const proposal = await this.findOne(id, false);

        // set new values
        proposal.Submitter = body.submitter;
        proposal.BlockStart = body.blockStart;
        proposal.BlockEnd = body.blockEnd;
        proposal.ExpiryTime = body.expiryTime;
        proposal.PostedAt = body.postedAt;
        proposal.ExpiredAt = body.expiredAt;
        proposal.ReceivedAt = body.receivedAt;
        proposal.Hash = body.hash;
        proposal.Item = body.item;
        proposal.Type = body.type;
        proposal.Title = body.title;
        proposal.Description = body.description;

        // update proposal record
        const updatedProposal = await this.proposalRepo.update(id, proposal.toJSON());
        return updatedProposal;
    }

    public async destroy(id: number): Promise<void> {
        await this.proposalRepo.destroy(id);
    }

}
