// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Image } from '../models/Image';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ImageRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Image) public ImageModel: typeof Image,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Image>> {
        const list = await this.ImageModel.fetchAll();
        return list as Bookshelf.Collection<Image>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Image> {
        return await this.ImageModel.fetchById(id, withRelated);
    }

    public async findAllByHash(id: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Image>> {
        return await this.ImageModel.fetchAllByHash(id, withRelated);
    }

    public async create(data: any): Promise<Image> {
        const image = this.ImageModel.forge<Image>(data);
        try {
            const imageCreated = await image.save();
            return await this.ImageModel.fetchById(imageCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the Image!', error);
        }
    }

    public async update(id: number, data: any): Promise<Image> {
        const image = this.ImageModel.forge<Image>({ id });
        try {
            const imageUpdated = await image.save(data, { patch: true });
            return await this.ImageModel.fetchById(imageUpdated.id);
        } catch (error) {
            this.log.error(error);
            throw new DatabaseException('Could not update the Image!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let image = this.ImageModel.forge<Image>({ id });
        try {
            image = await image.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await image.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the Image!', error);
        }
    }
}
