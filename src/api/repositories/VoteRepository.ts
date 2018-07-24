import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Vote } from '../models/Vote';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

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

    public async findOne(id: number, withRelated: boolean = true): Promise<Vote> {
        return this.VoteModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Vote> {
        const vote = this.VoteModel.forge<Vote>(data);
        try {
            const voteCreated = await vote.save();
            return this.VoteModel.fetchById(voteCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the vote!', error);
        }
    }

    public async update(id: number, data: any): Promise<Vote> {
        const vote = this.VoteModel.forge<Vote>({ id });
        try {
            const voteUpdated = await vote.save(data, { patch: true });
            return this.VoteModel.fetchById(voteUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the vote!', error);
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
            throw new DatabaseException('Could not delete the vote!', error);
        }
    }

}
