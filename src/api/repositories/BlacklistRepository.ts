// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Blacklist } from '../models/Blacklist';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { BlacklistType } from '../enums/BlacklistType';

export class BlacklistRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Blacklist) public BlacklistModel: typeof Blacklist,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Blacklist>> {
        const list = await this.BlacklistModel.fetchAll();
        return list as Bookshelf.Collection<Blacklist>;
    }

    public async findAllByType(type: BlacklistType): Promise<Bookshelf.Collection<Blacklist>> {
        return await this.BlacklistModel.fetchAllByType(type);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Blacklist> {
        return await this.BlacklistModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Blacklist> {
        const blacklist = this.BlacklistModel.forge<Blacklist>(data);
        try {
            const blacklistCreated = await blacklist.save();
            return await this.BlacklistModel.fetchById(blacklistCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the blacklist!', error);
        }
    }

    public async update(id: number, data: any): Promise<Blacklist> {
        const blacklist = this.BlacklistModel.forge<Blacklist>({ id });
        try {
            const blacklistUpdated = await blacklist.save(data, { patch: true });
            return await this.BlacklistModel.fetchById(blacklistUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the blacklist!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let blacklist = this.BlacklistModel.forge<Blacklist>({ id });
        try {
            blacklist = await blacklist.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await blacklist.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the blacklist!', error);
        }
    }

}
