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

    public async findForOption(optionId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Vote>> {
        const votes = await this.voteRepo.findForOption(optionId, withRelated);
        if (votes === null) {
            this.log.warn(`No votes with the optionId=${optionId} were found!`);
            throw new NotFoundException(optionId);
        }
        return votes;
    }

    @validate()
    public async create( @request(VoteCreateRequest) data: VoteCreateRequest): Promise<Vote> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Vote, body: ', JSON.stringify(body, null, 2));

        // TODO: extract and remove related models from request
        // const voteRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the vote
        const vote = await this.voteRepo.create(body);

        // TODO: create related models
        // voteRelated._id = vote.Id;
        // await this.voteRelatedService.create(voteRelated);

        // finally find and return the created vote
        const newVote = await this.findOne(vote.id);
        return newVote;
    }

    @validate()
    public async update(id: number, @request(VoteUpdateRequest) body: VoteUpdateRequest): Promise<Vote> {

        // find the existing one without related
        const vote = await this.findOne(id, false);

        // set new values
        vote.ProposalOptionId = body.proposalOptionId;
        vote.Voter = body.voter;
        vote.Block = body.block;
        vote.Weight = body.weight;

        // update vote record
        const updatedVote = await this.voteRepo.update(id, vote.toJSON());

        // const newVote = await this.findOne(id);
        // return newVote;

        return updatedVote;
    }

    public async destroy(id: number): Promise<void> {
        await this.voteRepo.destroy(id);
    }

}
