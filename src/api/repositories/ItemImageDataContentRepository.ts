// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemImageDataContent } from '../models/ItemImageDataContent';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ItemImageDataContentRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ItemImageDataContent) public ItemImageDataContentModel: typeof ItemImageDataContent,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageDataContent>> {
        const list = await this.ItemImageDataContentModel.fetchAll();
        return list as Bookshelf.Collection<ItemImageDataContent>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageDataContent> {
        return this.ItemImageDataContentModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ItemImageDataContent> {
        const itemImageDataContent = this.ItemImageDataContentModel.forge<ItemImageDataContent>(data);
        try {
            const itemImageDataContentCreated = await itemImageDataContent.save();
            return this.ItemImageDataContentModel.fetchById(itemImageDataContentCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the itemImageDataContent!', error);
        }
    }

    public async update(id: number, data: any): Promise<ItemImageDataContent> {
        const itemImageDataContent = this.ItemImageDataContentModel.forge<ItemImageDataContent>({ id });
        try {
            const itemImageDataContentUpdated = await itemImageDataContent.save(data, { patch: true });
            return this.ItemImageDataContentModel.fetchById(itemImageDataContentUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the itemImageDataContent!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemImageDataContent = this.ItemImageDataContentModel.forge<ItemImageDataContent>({ id });
        try {
            itemImageDataContent = await itemImageDataContent.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await itemImageDataContent.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the itemImageDataContent!', error);
        }
    }

}
