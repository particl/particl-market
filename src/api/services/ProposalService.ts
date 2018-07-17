import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { ProposalOptionRepository } from '../repositories/ProposalOptionRepository';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../../api/enums/HashableObjectType';

export class ProposalService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepo: ProposalRepository,
        @inject(Types.Repository) @named(Targets.Repository.ProposalOptionRepository) public proposalOptionRepository: ProposalOptionRepository,
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
        if (_.isEmpty(data.hash)) {
            data.hash = ObjectHash.getHash(data, HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST, false);
        }
        this.log.debug('data = ' + JSON.stringify(data, null, 2));
        let options = data.options;
        delete data.options;

        const body = JSON.parse(JSON.stringify(data));

        // If the request body was valid we will create the proposal
        const proposal = await this.proposalRepo.create(body);

        // Create options
        this.log.debug('ABC');
        this.log.debug(`options = ` + JSON.stringify(options, null, 2));
        this.log.debug(`options.length = ${options.length}`);
        for (let i in options) {
            if (i) {
                options[i].proposalId = proposal.id;
                this.log.debug(`option[${i}] = ` + JSON.stringify(options[i], null, 2));
                await this.proposalOptionRepository.create(options[i]);
            }
        }
        this.log.debug('CBA');

        // finally find and return the created proposal
        const newProposal = await this.findOne(proposal.id, true);
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
