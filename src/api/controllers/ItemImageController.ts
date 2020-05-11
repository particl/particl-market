// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam, request } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemImageService } from '../services/model/ItemImageService';
import { ItemImageHttpUploadService } from '../services/ItemImageHttpUploadService';
import { Logger as LoggerType } from '../../core/Logger';
import { ImagePostUploadRequest } from '../requests/action/ImagePostUploadRequest';
import { MessageException } from '../exceptions/MessageException';
import { ItemImageDataService } from '../services/model/ItemImageDataService';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.AuthenticateMiddleware);
const multerMiddleware = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.MulterMiddleware);

@controller('/item-images', multerMiddleware.use, restApi.use)
export class ItemImageController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) private itemImageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.ItemImageHttpUploadService) private itemImageHttpUploadService: ItemImageHttpUploadService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * upload images
     *
     * @param res
     * @param templateId
     * @param body
     * @param req
     */
    @httpPost('/template/:templateId')
    public async create(@response() res: myExpress.Response, @requestParam('templateId') templateId: string,
                        @requestBody() body: any, @request() req: any): Promise<resources.ItemImage[]> {

        const listingItemTemplateId = parseInt(templateId, 10);

        if (!req.files || req.files.length === 0) {
            throw new MessageException('Missing images.');
        }

        const imagePostRequest = {
            listingItemTemplateId,
            requestBody: body,
            request: req
        } as ImagePostUploadRequest;
        return this.itemImageHttpUploadService.httpPostImageUpload(imagePostRequest);
    }

    /**
     * publishes images through the rest api
     *
     * todo: change id to hash
     *
     * @param res
     * @param id
     * @param imageVersion
     */
    @httpGet('/:id/:imageVersion')
    public async publishImage(@response() res: myExpress.Response, @requestParam('id') id: string, @requestParam('imageVersion')
        imageVersion: string): Promise<any> {

        // todo: check validity of imageVersion and throw if not valid

        // find the itemImage by id
        const itemImageModel = await this.itemImageService.findOne(parseInt(id, 10));
        const itemImage: resources.ItemImage = itemImageModel.toJSON();

        // get the requested version of the image
        const itemImageData: resources.ItemImageData | undefined = await _.find(itemImage.ItemImageDatas, data => data['imageVersion'] === imageVersion);

        if (!itemImageData || itemImage.ItemImageDatas.length === 0) {
            throw new MessageException('Image not found!');
        } else {
            const data = await this.itemImageDataService.loadImageFile(itemImage.hash, imageVersion);
            const dataBuffer = Buffer.from(data, 'base64');
            res.setHeader('Content-Disposition', 'filename=' + itemImageData.data);
            res.send(dataBuffer);
        }
    }
}

