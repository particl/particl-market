import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ProposalResult } from '../models/ProposalResult';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ProposalResultRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ProposalResult) public ProposalResultModel: typeof ProposalResult,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalResult>> {
        const list = await this.ProposalResultModel.fetchAll();
        return list as Bookshelf.Collection<ProposalResult>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalResult> {
        return this.ProposalResultModel.fetchById(id, withRelated);
    }

    public async findOneFromHash(hash: string, withRelated: boolean = true): Promise<ProposalResult> {
        return this.ProposalResultModel.fetchByHash(hash, withRelated);
    }

    public async create(data: any): Promise<ProposalResult> {
        const proposalResult = this.ProposalResultModel.forge<ProposalResult>(data);
        try {
            const proposalResultCreated = await proposalResult.save();
            return this.ProposalResultModel.fetchById(proposalResultCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the proposalResult!', error);
        }
    }

    public async update(id: number, data: any): Promise<ProposalResult> {
        const proposalResult = this.ProposalResultModel.forge<ProposalResult>({ id });
        try {
            const proposalResultUpdated = await proposalResult.save(data, { patch: true });
            return this.ProposalResultModel.fetchById(proposalResultUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the proposalResult!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let proposalResult = this.ProposalResultModel.forge<ProposalResult>({ id });
        try {
            proposalResult = await proposalResult.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await proposalResult.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the proposalResult!', error);
        }
    }

}
