// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Identity } from '../models/Identity';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class IdentityRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Identity) public IdentityModel: typeof Identity,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Identity>> {
        const list = await this.IdentityModel.fetchAll();
        return list as Bookshelf.Collection<Identity>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Identity> {
        return await this.IdentityModel.fetchById(id, withRelated);
    }

    public async findOneByWalletName(name: string, withRelated: boolean = true): Promise<Identity> {
        return await this.IdentityModel.fetchByWalletName(name, withRelated);
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Identity>> {
        return await this.IdentityModel.fetchAllByProfileId(profileId, withRelated);
    }

    public async findOneByAddress(name: string, withRelated: boolean = true): Promise<Identity> {
        return await this.IdentityModel.fetchByAddress(name, withRelated);
    }

    public async create(data: any): Promise<Identity> {
        const identity = this.IdentityModel.forge<Identity>(data);
        try {
            const identityCreated = await identity.save();
            return await this.IdentityModel.fetchById(identityCreated.id);
        } catch (error) {
            this.log.error('ERROR: ', error);
            throw new DatabaseException('Could not create the identity!', error);
        }
    }

    public async update(id: number, data: any): Promise<Identity> {
        const wallet = this.IdentityModel.forge<Identity>({ id });
        try {
            const walletUpdated = await wallet.save(data, { patch: true });
            return await this.IdentityModel.fetchById(walletUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the identity!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let wallet = this.IdentityModel.forge<Identity>({ id });
        try {
            wallet = await wallet.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await wallet.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the wallet!', error);
        }
    }

}
