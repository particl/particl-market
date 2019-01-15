// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ProposalOptionResult } from '../models/ProposalOptionResult';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ProposalOptionResultRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ProposalOptionResult) public ProposalOptionResultModel: typeof ProposalOptionResult,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalOptionResult>> {
        const list = await this.ProposalOptionResultModel.fetchAll();
        return list as Bookshelf.Collection<ProposalOptionResult>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalOptionResult> {
        return this.ProposalOptionResultModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ProposalOptionResult> {
        const proposalOptionResult = this.ProposalOptionResultModel.forge<ProposalOptionResult>(data);
        try {
            const proposalOptionResultCreated = await proposalOptionResult.save();
            return this.ProposalOptionResultModel.fetchById(proposalOptionResultCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the proposalOptionResult! ' + error, error);
        }
    }

    public async update(id: number, data: any): Promise<ProposalOptionResult> {
        const proposalOptionResult = this.ProposalOptionResultModel.forge<ProposalOptionResult>({ id });
        try {
            const proposalOptionResultUpdated = await proposalOptionResult.save(data, { patch: true });
            return this.ProposalOptionResultModel.fetchById(proposalOptionResultUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the proposalOptionResult!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let proposalOptionResult = this.ProposalOptionResultModel.forge<ProposalOptionResult>({ id });
        try {
            proposalOptionResult = await proposalOptionResult.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await proposalOptionResult.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the proposalOptionResult!', error);
        }
    }

}
