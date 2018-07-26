import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Proposal } from '../models/Proposal';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ProposalRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Proposal) public ProposalModel: typeof Proposal,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Proposal>> {
        const list = await this.ProposalModel.fetchAll();
        return list as Bookshelf.Collection<Proposal>;
    }

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Proposal> {
        return this.ProposalModel.fetchByHash(hash, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Proposal> {
        return this.ProposalModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Proposal> {
        const proposal = this.ProposalModel.forge<Proposal>(data);
        try {
            const proposalCreated = await proposal.save();
            return this.ProposalModel.fetchById(proposalCreated.id);
        } catch (error) {
            this.log.error('error:', error);
            throw new DatabaseException('Could not create the proposal!', error);
        }
    }

    public async update(id: number, data: any): Promise<Proposal> {
        const proposal = this.ProposalModel.forge<Proposal>({ id });
        try {
            const proposalUpdated = await proposal.save(data, { patch: true });
            return this.ProposalModel.fetchById(proposalUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the proposal!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let proposal = this.ProposalModel.forge<Proposal>({ id });
        try {
            proposal = await proposal.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await proposal.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the proposal!', error);
        }
    }

}
