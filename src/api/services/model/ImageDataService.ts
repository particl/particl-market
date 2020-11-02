// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import * as path from 'path';
import * as fs from 'fs';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ValidationException } from '../../exceptions/ValidationException';
import { ImageDataRepository } from '../../repositories/ImageDataRepository';
import { ImageData } from '../../models/ImageData';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageDataUpdateRequest } from '../../requests/model/ImageDataUpdateRequest';
import { DataDir } from '../../../core/helpers/DataDir';
import { MessageException } from '../../exceptions/MessageException';

export class ImageDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ImageDataRepository) public imageDataRepo: ImageDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ImageData>> {
        return this.imageDataRepo.findAll();
    }

    public async findAllByImageHashAndVersion(hash: string, version: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ImageData>> {
        return await this.imageDataRepo.findAllByImageHashAndVersion(hash, version, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ImageData> {
        const imageData = await this.imageDataRepo.findOne(id, withRelated);
        if (imageData === null) {
            this.log.warn(`ImageData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return imageData;
    }

    public async findOneByImageIdAndVersion(imageId: number, version: string, withRelated: boolean = true): Promise<ImageData> {
        const imageData = await this.imageDataRepo.findOneByImageIdAndVersion(imageId, version, withRelated);
        if (imageData === null) {
            this.log.warn(`ImageData with the imageId=${imageId} and version=${version} was not found!`);
            throw new NotFoundException(imageId);
        }
        return imageData;
    }

    @validate()
    public async create( @request(ImageDataCreateRequest) data: ImageDataCreateRequest): Promise<ImageData> {
        const body = JSON.parse(JSON.stringify(data));

        if (!_.isNil(body.data)) {
            body.dataId = await this.saveImageFile(body.data, body.imageHash, body.imageVersion);
            delete body.data;
        }

        // this.log.debug('create(), body: ', JSON.stringify(body, null, 2));
        const imageData: resources.ImageData = await this.imageDataRepo.create(body).then(value => value.toJSON());
        return await this.findOne(imageData.id);
    }

    @validate()
    public async update(id: number, @request(ImageDataUpdateRequest) data: ImageDataUpdateRequest): Promise<ImageData> {
        const body = JSON.parse(JSON.stringify(data));

        const imageData = await this.findOne(id, false);

        await this.removeImageFile(imageData.ImageHash, imageData.ImageVersion);
        body.dataId = await this.saveImageFile(body.data, body.imageHash, body.imageVersion);
        delete body.data;

        // set new values
        if (body.dataId) {
            imageData.DataId = body.dataId;
        }
        if (body.protocol) {
            imageData.Protocol = body.protocol;
        }
        if (body.imageVersion) {
            imageData.ImageVersion = body.imageVersion;
        }
        if (body.imageHash) {
            imageData.ImageHash = body.imageHash;
        }
        if (body.encoding) {
            imageData.Encoding = body.encoding;
        }
        if (body.data) {
            imageData.Data = body.data;
        }
        if (body.originalMime) {
            imageData.OriginalMime = body.originalMime;
        }
        if (body.originalName) {
            imageData.OriginalName = body.originalName;
        }

        return await this.imageDataRepo.update(id, imageData.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        const imageData: resources.ImageData = await this.findOne(id, false).then(value => value.toJSON());
        this.log.debug('destroy(), remove imageData.id: ' + imageData.id);
        await this.removeImageFile(imageData.imageHash, imageData.imageVersion);
        await this.imageDataRepo.destroy(id);
    }

    /**
     * save the Image (version)
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
        // this.log.debug('saveImageFile(): ', filename);
        try {
            fs.writeFileSync(filename, base64Image, { encoding: 'base64' });
        } catch (err) {
            throw new MessageException('Image write failed: ' + err);
        }
        return filename;
    }

    /**
     * remove the Image (version)
     *
     * @param imageHash
     * @param imageVersion
     */
    public async removeImageFile(imageHash: string, imageVersion: string): Promise<void> {
        this.log.debug('removeImageFile(), imageVersion: ', imageVersion);

        const imageDatas: resources.ImageData[] = await this.findAllByImageHashAndVersion(imageHash, imageVersion).then(value => value.toJSON());
        if (imageDatas.length === 0) {
            this.log.warn('removeImageFile(): no file to remove.');
            return;
        }

        // only remove the file if there is just this one Image related to it
        if (imageDatas.length === 1) {
            const filename = path.join(DataDir.getImagesPath(), imageHash + '-' + imageVersion);
            this.log.debug('removeImageFile(), removed: ', filename);
            try {
                // file might not yet exist on a remote node receiving the image
                if (fs.existsSync(filename)) {
                    fs.unlinkSync(filename);
                }
            } catch (err) {
                this.log.error('removeImageFile(), image file remove failed: ' + err);
                throw new MessageException('Image remove failed: ' + err);
            }
        } else {
            this.log.debug('removeImageFile(): multiple images using the same data file, skipping...');
        }

    }

    /**
     * load the Image (version)
     *
     * @param imageHash
     * @param imageVersion
     * @return base64 encoded string
     */
    public async loadImageFile(imageHash: string, imageVersion: string): Promise<string> {
        const filename = path.join(DataDir.getImagesPath(), imageHash + '-' + imageVersion);
        this.log.debug('loadImageFile(): ', filename);
        try {
            return fs.readFileSync(filename, { encoding: 'base64' });
        } catch (err) {
            throw new MessageException('Image load failed: ' + err);
        }
    }
}
