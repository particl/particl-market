import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';

export class ProposalService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepo: ProposalRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Proposal>> {
        return this.proposalRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Proposal> {
        const proposal = await this.proposalRepo.findOne(id, withRelated);
        if (proposal === null) {
            this.log.warn(`Proposal with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return proposal;
    }

    @validate()
    public async create( @request(ProposalCreateRequest) data: ProposalCreateRequest): Promise<Proposal> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Proposal, body: ', JSON.stringify(body, null, 2));

        // TODO: extract and remove related models from request
        // const proposalRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the proposal
        const proposal = await this.proposalRepo.create(body);

        // TODO: create related models
        // proposalRelated._id = proposal.Id;
        // await this.proposalRelatedService.create(proposalRelated);

        // finally find and return the created proposal
        const newProposal = await this.findOne(proposal.id);
        return newProposal;
    }

    @validate()
    public async update(id: number, @request(ProposalUpdateRequest) body: ProposalUpdateRequest): Promise<Proposal> {

        // find the existing one without related
        const proposal = await this.findOne(id, false);

        // set new values
        proposal.Submitter = body.submitter;
        proposal.BlockStart = body.blockStart;
        proposal.BlockEnd = body.blockEnd;
        proposal.CreatedAt = body.createdAt;
        proposal.Submitter = body.submitter;
        proposal.Hash = body.hash;
        proposal.Type = body.type;
        proposal.Description = body.description;

        // update proposal record
        const updatedProposal = await this.proposalRepo.update(id, proposal.toJSON());

        // const newProposal = await this.findOne(id);
        // return newProposal;

        return updatedProposal;
    }

    public async destroy(id: number): Promise<void> {
        await this.proposalRepo.destroy(id);
    }

}
