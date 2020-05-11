// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemImageData } from '../models/ItemImageData';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ItemImageDataRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ItemImageData) public ItemImageDataModel: typeof ItemImageData,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageData>> {
        const list = await this.ItemImageDataModel.fetchAll();
        return list as Bookshelf.Collection<ItemImageData>;
    }

    public async findAllByImageHashAndVersion(hash: string, version: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ItemImageData>> {
        return await this.ItemImageDataModel.fetchAllByImageHashAndVersion(hash, version, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageData> {
        return this.ItemImageDataModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ItemImageData> {
        const itemImageData = this.ItemImageDataModel.forge<ItemImageData>(data);
        try {
            const itemImageDataCreated = await itemImageData.save();
            return this.ItemImageDataModel.fetchById(itemImageDataCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the itemImageData!', error);
        }
    }

    public async update(id: number, data: any): Promise<ItemImageData> {
        const itemImageData = this.ItemImageDataModel.forge<ItemImageData>({ id });
        try {
            const itemImageDataUpdated = await itemImageData.save(data, { patch: true });
            return this.ItemImageDataModel.fetchById(itemImageDataUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the itemImageData!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemImageData = this.ItemImageDataModel.forge<ItemImageData>({ id });
        try {
            itemImageData = await itemImageData.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await itemImageData.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the itemImageData!', error);
        }
    }

}
