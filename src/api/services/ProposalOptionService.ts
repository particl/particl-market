import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalOptionRepository } from '../repositories/ProposalOptionRepository';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { Proposal } from '../models/Proposal';
import { ProposalOption } from '../models/ProposalOption';
import { ProposalOptionCreateRequest } from '../requests/ProposalOptionCreateRequest';
import { ProposalOptionUpdateRequest } from '../requests/ProposalOptionUpdateRequest';


export class ProposalOptionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalOptionRepository) public proposalOptionRepo: ProposalOptionRepository,
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepository: ProposalRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalOption>> {
        return this.proposalOptionRepo.findAll();
    }

    public async findOneFromHashAndOptionId(proposalHash: string, optionId: number, withRelated: boolean = true): Promise<ProposalOption> {
        let proposal: any = await this.proposalRepository.findOneByHash(proposalHash, true);
        if (proposal === null) {
            this.log.warn(`Proposal with the hash=${proposalHash} was not found!`);
            throw new NotFoundException(proposalHash);
        }
        proposal = proposal.toJSON();
        if (!proposal.options || !proposal.options[optionId]) {
            this.log.warn(`Proposal option with the hash=${proposalHash} and optionId = ${optionId} was not found!`);
            throw new NotFoundException(proposalHash);
        }
        return proposal.options[optionId];
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalOption> {
        const proposalOption = await this.proposalOptionRepo.findOne(id, withRelated);
        if (proposalOption === null) {
            this.log.warn(`ProposalOption with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return proposalOption;
    }

    @validate()
    public async create( @request(ProposalOptionCreateRequest) data: ProposalOptionCreateRequest): Promise<ProposalOption> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create ProposalOption, body: ', JSON.stringify(body, null, 2));

        // TODO: extract and remove related models from request
        // const proposalOptionRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the proposalOption
        const proposalOption = await this.proposalOptionRepo.create(body);

        // TODO: create related models
        // proposalOptionRelated._id = proposalOption.Id;
        // await this.proposalOptionRelatedService.create(proposalOptionRelated);

        // finally find and return the created proposalOption
        const newProposalOption = await this.findOne(proposalOption.id);
        return newProposalOption;
    }

    @validate()
    public async update(id: number, @request(ProposalOptionUpdateRequest) body: ProposalOptionUpdateRequest): Promise<ProposalOption> {

        // find the existing one without related
        const proposalOption = await this.findOne(id, false);

        // set new values
        proposalOption.ProposalId = body.proposalId;
        proposalOption.OptionId = body.optionId;
        proposalOption.Description = body.description;
        proposalOption.Hash = body.hash;

        // update proposalOption record
        const updatedProposalOption = await this.proposalOptionRepo.update(id, proposalOption.toJSON());

        // const newProposalOption = await this.findOne(id);
        // return newProposalOption;

        return updatedProposalOption;
    }

    public async destroy(id: number): Promise<void> {
        await this.proposalOptionRepo.destroy(id);
    }

}
