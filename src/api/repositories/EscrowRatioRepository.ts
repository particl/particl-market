// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { EscrowRatio } from '../models/EscrowRatio';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class EscrowRatioRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.EscrowRatio) public EscrowRatioModel: typeof EscrowRatio,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<EscrowRatio>> {
        const list = await this.EscrowRatioModel.fetchAll();
        return list as Bookshelf.Collection<EscrowRatio>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<EscrowRatio> {
        return this.EscrowRatioModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<EscrowRatio> {
        const escrowRatio = this.EscrowRatioModel.forge<EscrowRatio>(data);
        try {
            const escrowRatioCreated = await escrowRatio.save();
            return this.EscrowRatioModel.fetchById(escrowRatioCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the escrowRatio!', error);
        }
    }

    public async update(id: number, data: any): Promise<EscrowRatio> {
        const escrowRatio = this.EscrowRatioModel.forge<EscrowRatio>({ id });
        try {
            const escrowRatioUpdated = await escrowRatio.save(data, { patch: true });
            return this.EscrowRatioModel.fetchById(escrowRatioUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the escrowRatio!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let escrowRatio = this.EscrowRatioModel.forge<EscrowRatio>({ id });
        try {
            escrowRatio = await escrowRatio.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await escrowRatio.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the escrowRatio!', error);
        }
    }

}
