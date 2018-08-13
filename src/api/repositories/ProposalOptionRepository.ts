import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ProposalOption } from '../models/ProposalOption';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ProposalOptionRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ProposalOption) public ProposalOptionModel: typeof ProposalOption,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalOption>> {
        const list = await this.ProposalOptionModel.fetchAll();
        return list as Bookshelf.Collection<ProposalOption>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalOption> {
        return this.ProposalOptionModel.fetchById(id, withRelated);
    }

    public async findOneByProposalAndOptionId(proposalId: number, optionId: number, withRelated: boolean = true): Promise<ProposalOption> {
        return this.ProposalOptionModel.fetchByProposalAndOptionId(proposalId, optionId);
    }

    public async create(data: any): Promise<ProposalOption> {
        const proposalOption = this.ProposalOptionModel.forge<ProposalOption>(data);
        try {
            const proposalOptionCreated = await proposalOption.save();
            return this.ProposalOptionModel.fetchById(proposalOptionCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the proposalOption!' + error, error);
        }
    }

    public async update(id: number, data: any): Promise<ProposalOption> {
        const proposalOption = this.ProposalOptionModel.forge<ProposalOption>({ id });
        try {
            const proposalOptionUpdated = await proposalOption.save(data, { patch: true });
            return this.ProposalOptionModel.fetchById(proposalOptionUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the proposalOption!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let proposalOption = this.ProposalOptionModel.forge<ProposalOption>({ id });
        try {
            proposalOption = await proposalOption.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await proposalOption.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the proposalOption!', error);
        }
    }

}
