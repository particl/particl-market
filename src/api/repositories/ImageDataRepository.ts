// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ImageData } from '../models/ImageData';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ImageDataRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ImageData) public ImageDataModel: typeof ImageData,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ImageData>> {
        const list = await this.ImageDataModel.fetchAll();
        return list as Bookshelf.Collection<ImageData>;
    }

    public async findAllByImageHashAndVersion(hash: string, version: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ImageData>> {
        return await this.ImageDataModel.fetchAllByImageHashAndVersion(hash, version, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ImageData> {
        return this.ImageDataModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ImageData> {
        const itemImageData = this.ImageDataModel.forge<ImageData>(data);
        try {
            const itemImageDataCreated = await itemImageData.save();
            return await this.ImageDataModel.fetchById(itemImageDataCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the itemImageData!', error);
        }
    }

    public async update(id: number, data: any): Promise<ImageData> {
        const itemImageData = this.ImageDataModel.forge<ImageData>({ id });
        try {
            const itemImageDataUpdated = await itemImageData.save(data, { patch: true });
            return await this.ImageDataModel.fetchById(itemImageDataUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the itemImageData!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemImageData = this.ImageDataModel.forge<ImageData>({ id });
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
