// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as fs from 'fs';
import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, response, requestBody, requestParam, request } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ImageService } from '../services/model/ImageService';
import { Logger as LoggerType } from '../../core/Logger';
import { ImageUploadRequest, UploadedFile } from '../requests/action/ImageUploadRequest';
import { MessageException } from '../exceptions/MessageException';
import { ImageDataService } from '../services/model/ImageDataService';
import { CoreMessageVersion } from '../enums/CoreMessageVersion';
import { ListingItemTemplateService } from '../services/model/ListingItemTemplateService';
import { Image } from '../models/Image';
import { ImageCreateRequest } from '../requests/model/ImageCreateRequest';
import { DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { BaseImageAddMessage } from '../messages/action/BaseImageAddMessage';
import { ImageCreateParams } from '../factories/ModelCreateParams';
import { ImageFactory } from '../factories/model/ImageFactory';
import { MarketService } from '../services/model/MarketService';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.AuthenticateMiddleware);
const multerMiddleware = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.MulterMiddleware);

@controller('/images', multerMiddleware.use, restApi.use)
export class ImageController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) private imageDataService: ImageDataService,
        @inject(Types.Factory) @named(Targets.Factory.model.ImageFactory) private imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * upload template images
     *
     * @param res
     * @param listingItemTemplateId
     * @param body
     * @param req
     */
    @httpPost('/template/:listingItemTemplateId')
    public async uploadTemplateImage(@response() res: myExpress.Response,
                                     @requestParam('listingItemTemplateId') listingItemTemplateId: string,
                                     @requestBody() body: any,
                                     @request() req: any): Promise<resources.Image[]> {
        return await this.upload(res, req, body, listingItemTemplateId);
    }

    @httpPost('/market/:marketId')
    public async uploadMarketImage(@response() res: myExpress.Response,
                                   @requestParam('marketId') marketId: string,
                                   @requestBody() body: any,
                                   @request() req: any): Promise<resources.Image[]> {
        return await this.upload(res, req, body, undefined, marketId);
    }

    public async upload(res: myExpress.Response, req: any, body: any, listingItemTemplateId?: string, marketId?: string): Promise<resources.Image[]> {

        if (!req.files || req.files.length === 0) {
            throw new MessageException('Missing images.');
        }

        const files: UploadedFile[] = [...req.files];

        const imageUploadRequest = {
            listingItemTemplateId: !_.isNil(listingItemTemplateId) ? parseInt(listingItemTemplateId, 10) : undefined,
            marketId: !_.isNil(marketId) ? parseInt(marketId, 10) : undefined,
            files
        } as ImageUploadRequest;

        return await this.createImages(imageUploadRequest);
    }

    /**
     * uploadRequest.listingItemTemplateId
     * uploadRequest.marketId
     * uploadRequest.files: {
     *      fieldname: "image",
     *      originalname: "image.jpg",
     *      encoding: "7bit",
     *      mimetype: "image/jpeg",
     *      destination: "data/uploads",
     *      filename: "f133eec00f7bd0d859a48ea5519e475d",
     *      path: "data/uploads/f133eec00f7bd0d859a48ea5519e475d",
     *      size: 8141
     * }
     *
     * @param uploadRequest
     */
    public async createImages(uploadRequest: ImageUploadRequest): Promise<resources.Image[]> {

        this.log.debug('createImages(), uploadRequest:', JSON.stringify(uploadRequest, null, 2));

        const createdImages: resources.Image[] = [];
        let listingItemTemplate: resources.ListingItemTemplate | undefined;

        if (!_.isNil(uploadRequest.listingItemTemplateId)) {
            listingItemTemplate = await this.listingItemTemplateService.findOne(uploadRequest.listingItemTemplateId).then(value => value.toJSON());
        }

        for (const file of uploadRequest.files) {
            const createdImage: resources.Image = await this.createFromFile(file, listingItemTemplate);
            createdImages.push(createdImage);
        }

        // create also the resized template images
        const messageVersionToFit = CoreMessageVersion.PAID;
        const scalingFraction = 0.9;
        const qualityFraction = 0.9;
        const maxIterations = 10;

        if (!_.isNil(uploadRequest.listingItemTemplateId)) {
            await this.listingItemTemplateService.resizeTemplateImages(listingItemTemplate!, messageVersionToFit, scalingFraction,
                qualityFraction, maxIterations);
        } else if (!_.isNil(uploadRequest.marketId)) {
            await this.imageService.createResizedVersion(createdImages[0].id, messageVersionToFit, scalingFraction, qualityFraction, maxIterations);
            await this.marketService.setImage(uploadRequest.marketId, createdImages[0].id);
        }

        return createdImages;
    }

    /**
     * create(), but get data from a local file instead.
     * used to create the ORIGINAL image version from the uploaded file
     *
     * @param imageFile
     * @param listingItemTemplate
     * @returns {Promise<Image>}
     */
    public async createFromFile(imageFile: UploadedFile, listingItemTemplate?: resources.ListingItemTemplate): Promise<resources.Image> {
        const dataStr = fs.readFileSync(imageFile.path, 'base64');

        const imageCreateRequest: ImageCreateRequest = await this.imageFactory.get({
            actionMessage: {
                data: [{
                    protocol: ProtocolDSN.REQUEST,
                    encoding: 'BASE64',
                    // dataId: '',
                    data: dataStr
                }] as DSN[]
                // featured             // TODO: add featured
            } as BaseImageAddMessage,
            listingItemTemplate
        } as ImageCreateParams);

        // imageCreateRequest.hash = ConfigurableHasher.hash(imageCreateRequest, new HashableImageCreateRequestConfig());

        this.log.debug('imageCreateRequest:', JSON.stringify(imageCreateRequest, null, 2));

        return await this.imageService.create(imageCreateRequest).then(value => value.toJSON());
    }


    /**
     * publishes images through the rest api
     *
     * todo: change id to hash?
     *
     * @param res
     * @param id
     * @param imageVersion
     */
    @httpGet('/:id/:imageVersion')
    public async publishImage(@response() res: myExpress.Response, @requestParam('id') id: string, @requestParam('imageVersion')
        imageVersion: string): Promise<any> {

        // todo: check validity of imageVersion and throw if not valid

        const image: resources.Image = await this.imageService.findOne(parseInt(id, 10)).then(value => value.toJSON());
        const imageData: resources.ImageData | undefined = await _.find(image.ImageDatas, data => data['imageVersion'] === imageVersion);

        if (!imageData || image.ImageDatas.length === 0) {
            throw new MessageException('Image not found!');
        } else {
            const data = await this.imageDataService.loadImageFile(image.hash, imageVersion);
            const dataBuffer = Buffer.from(data, 'base64');
            res.setHeader('Content-Disposition', 'filename=' + imageData.data);
            res.send(dataBuffer);
        }
    }
}

