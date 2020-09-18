// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam, request } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ImageService } from '../services/model/ImageService';
import { ImageHttpUploadService } from '../services/ImageHttpUploadService';
import { Logger as LoggerType } from '../../core/Logger';
import { ImageUploadRequest } from '../requests/action/ImageUploadRequest';
import { MessageException } from '../exceptions/MessageException';
import { ImageDataService } from '../services/model/ImageDataService';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.AuthenticateMiddleware);
const multerMiddleware = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.MulterMiddleware);

@controller('/images', multerMiddleware.use, restApi.use)
export class ImageController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) private imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.ImageHttpUploadService) private imageHttpUploadService: ImageHttpUploadService,
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
    public async uploadTemplateImage(@response() res: myExpress.Response, @requestParam('listingItemTemplateId') listingItemTemplateId: string,
                                     @requestBody() body: any, @request() req: any): Promise<resources.Image[]> {
        return await this.upload(res, req, body, listingItemTemplateId);
    }

    @httpPost('/market/:marketId')
    public async uploadMarketImage(@response() res: myExpress.Response, @requestParam('marketId') marketId: string,
                                   @requestBody() body: any, @request() req: any): Promise<resources.Image[]> {
        return await this.upload(res, req, body, undefined, marketId);
    }

    public async upload(res: myExpress.Response, req: any, body: any, listingItemTemplateId?: string, marketId?: string): Promise<resources.Image[]> {
        if (!req.files || req.files.length === 0) {
            throw new MessageException('Missing images.');
        }

        const imagePostRequest = {
            listingItemTemplateId: !_.isNil(listingItemTemplateId) ? parseInt(listingItemTemplateId, 10) : undefined,
            marketId: !_.isNil(marketId) ? parseInt(marketId, 10) : undefined,
            requestBody: body,
            request: req
        } as ImageUploadRequest;
        return this.imageHttpUploadService.httpPostImageUpload(imagePostRequest);
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

