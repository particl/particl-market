// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as path from 'path';
import * as fs from 'fs';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { ItemImageDataRepository } from '../repositories/ItemImageDataRepository';
import { ItemImageData } from '../models/ItemImageData';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../requests/ItemImageDataUpdateRequest';
import { DataDir } from '../../core/helpers/DataDir';
import { MessageException } from '../exceptions/MessageException';

export class ItemImageDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemImageDataRepository) public itemImageDataRepo: ItemImageDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.itemImageDataRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageData> {
        const itemImageData = await this.itemImageDataRepo.findOne(id, withRelated);
        if (itemImageData === null) {
            this.log.warn(`ItemImageData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImageData;
    }

    @validate()
    public async create( @request(ItemImageDataCreateRequest) data: ItemImageDataCreateRequest): Promise<ItemImageData> {
        const startTime = new Date().getTime();
        const body = JSON.parse(JSON.stringify(data));

        if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null ) {
            throw new ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
        }

        if (body.encoding !== 'BASE64') {
            this.log.warn('Unsupported image encoding. Only supports BASE64.');
        }

        const fileName = await this.saveImageFile(body.data, body.imageHash, body.imageVersion);
        body.data = fileName;

        const itemImageData = await this.itemImageDataRepo.create(body);

        // finally find and return the created itemImageData
        const newItemImageData = await this.findOne(itemImageData.Id);
        // this.log.debug('itemImageDataService.create: ' + (new Date().getTime() - startTime) + 'ms');
        return newItemImageData;
    }

    @validate()
    public async update(id: number, @request(ItemImageDataUpdateRequest) data: ItemImageDataUpdateRequest): Promise<ItemImageData> {

        const startTime = new Date().getTime();
        const body = JSON.parse(JSON.stringify(data));

        if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null ) {
            throw new ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
        }

        if (body.encoding !== 'BASE64') {
            this.log.warn('Unsupported image encoding. Only supports BASE64.');
        }

        // find the existing one without related
        const itemImageData = await this.findOne(id, false);

        await this.removeImageFile(itemImageData.ImageHash, itemImageData.ImageVersion);
        const fileName = await this.saveImageFile(body.data, body.imageHash, body.imageVersion);
        body.data = fileName;

        // set new values
        if (body.dataId) {
            itemImageData.DataId = body.dataId;
        }
        if (body.protocol) {
            itemImageData.Protocol = body.protocol;
        }
        if (body.imageVersion) {
            itemImageData.ImageVersion = body.imageVersion;
        }
        if (body.imageHash) {
            itemImageData.ImageHash = body.imageHash;
        }
        if (body.encoding) {
            itemImageData.Encoding = body.encoding;
        }
        if (body.data) {
            itemImageData.Data = body.data;
        }
        if (body.originalMime) {
            itemImageData.OriginalMime = body.originalMime;
        }
        if (body.originalName) {
            itemImageData.OriginalName = body.originalName;
        }

        // update itemImageData record
        const updatedItemImageData = await this.itemImageDataRepo.update(id, itemImageData.toJSON());
        // this.log.debug('itemImageDataService.update: ' + (new Date().getTime() - startTime) + 'ms');
        return updatedItemImageData;
    }

    public async destroy(id: number): Promise<void> {
        // find the existing one without related
        const itemImageDataModel = await this.findOne(id, false);
        const itemImageData = itemImageDataModel.toJSON();

        await this.removeImageFile(itemImageData.imageHash, itemImageData.imageVersion);
        await this.itemImageDataRepo.destroy(id);
    }

    /**
     * save the ItemImage (version)
     *
     * @param base64String
     * @param imageHash
     * @param imageVersion
     * @returns path to the file
     */
    public async saveImageFile(base64String: string, imageHash: string, imageVersion: string): Promise<string> {
        // strip header and write the file
        const base64Image = base64String.split(';base64,').pop();
        const filename = path.join(DataDir.getImagesPath(), imageHash + '-' + imageVersion);
        this.log.debug('saveImageFile(): ', filename);
        try {
            fs.writeFileSync(filename, base64Image, { encoding: 'base64' });
        } catch (err) {
            throw new MessageException('Image write failed: ' + err);
        }
        return filename;
    }

    /**
     * remove the ItemImage (version)
     *
     * @param imageHash
     * @param imageVersion
     */
    public async removeImageFile(imageHash: string, imageVersion: string): Promise<void> {
        const filename = path.join(DataDir.getImagesPath(), imageHash + '-' + imageVersion);
        // this.log.debug('removeImageFile(): ', filename);
        try {
            fs.unlinkSync(filename);
        } catch (err) {
            throw new MessageException('Image remove failed: ' + err);
        }
    }

    /**
     * load the ItemImage (version)
     *
     * @param imageHash
     * @param imageVersion
     * @return base64 encoded string
     */
    public async loadImageFile(imageHash: string, imageVersion: string): Promise<string> {
        const filename = path.join(DataDir.getImagesPath(), imageHash + '-' + imageVersion);
        // this.log.debug('loadImageFile(): ', filename);
        try {
            return fs.readFileSync(filename, { encoding: 'base64' });
        } catch (err) {
            throw new MessageException('Image load failed: ' + err);
        }
    }
}
