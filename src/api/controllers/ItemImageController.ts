import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam, request } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemImageService } from '../services/ItemImageService';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { Logger as LoggerType } from '../../core/Logger';
import sharp = require('sharp');
import * as _ from 'lodash';
import { Commands } from '../commands/CommandEnumType';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { ItemImageUpdateRequest } from '../requests/ItemImageUpdateRequest';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { MessageException } from '../exceptions/MessageException';
import * as fs from 'fs';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.AuthenticateMiddleware);
const multerMiddleware = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.MulterMiddleware);

@controller('/item-images', multerMiddleware.use, restApi.use)
export class ItemImageController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const itemImages = await this.itemImageService.findAll();
        this.log.debug('findAll: ', JSON.stringify(itemImages, null, 2));
        return res.found(itemImages.toJSON());
    }

    @httpPost('/template/:templateId')
    public async create( @response() res: myExpress.Response, @requestParam('templateId') templateIdStr: string,
                         @requestBody() body: any, @request() req: any): Promise<any> {
        // check templateId is number
        // also check listingItemTemplate id present in params
        let templateId: number;
        if (!templateIdStr) {
            throw new MessageException('ListingItemTemplate id can not be null.');
        } else {
            templateId = parseInt(templateIdStr, 10);
            if ( !templateId ) {
                throw new MessageException('ListingItemTemplate id must be an integer.');
            }
        }

        // this.log.debug('templateId: ' + templateId);
        // this.log.debug('files: ', req.files);

        for ( const file of req.files ) {
            // this.log.debug(`Found image <${file.fieldname}>.`);
            if ( file.fieldname === 'image' ) {
                const imageFile = file;

                // Read the file data in
                const dataStr = fs.readFileSync(imageFile.path, 'base64');
                // this.log.error('dataStr = ' + dataStr);

                // find listing item template
                const listingItemTemplate = await this.listingItemTemplateService.findOne(templateId);
                this.log.debug('imageFile.mimetype = ' + imageFile.mimetype);
                // find related itemInformation
                const itemInformation = await listingItemTemplate.related('ItemInformation').toJSON();
                const itemImage = itemInformation.ItemImages[0];
                if ( !itemImage ) {
                    // Doesn't exist yet, create instead of update
                    const tmpDataId = this.makeid();
                    return await this.itemImageService.create(
                        {
                            item_information_id: itemInformation.id,
                            hash: ObjectHash.getHash(itemInformation),
                            data: {
                                protocol: ImageDataProtocolType.LOCAL,
                                encoding: 'BASE64',
                                data: dataStr,
                                dataId: tmpDataId,
                                originalMime: imageFile.mimetype,
                                originalName: imageFile.originalname
                            }
                        } as ItemImageUpdateRequest);
                } else {
                    const itemImageId = itemImage.id;
                    // this.log.debug('itemImage = ' + JSON.stringify(itemImage));
                    this.log.debug('itemImageId = ' + itemImageId);

                    // create item images
                    return await this.itemImageService.update(
                        itemImageId,
                        {
                            item_information_id: itemInformation.id,
                            hash: ObjectHash.getHash(itemInformation),
                            data: {
                                protocol: ImageDataProtocolType.LOCAL,
                                encoding: 'BASE64',
                                data: dataStr,
                                originalMime: imageFile.mimetype,
                                originalName: imageFile.originalname
                            }
                        } as ItemImageUpdateRequest);
                }
            }
        }
        throw new MessageException('Was expecting an image file called "image".');
    }

    public makeid(): string {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';

        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const itemImage = await this.itemImageService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(itemImage, null, 2));
        return res.found(itemImage.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const itemImage = await this.itemImageService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(itemImage, null, 2));
        return res.updated(itemImage.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.itemImageService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }

    @httpGet('/:id/:imageVersion')
    public async publishImage( @response() res: myExpress.Response, @requestParam('id') id: string, @requestParam('imageVersion')
      imageVersion: string): Promise<any> {

      // find the itemImage by id
      const itemImage = await this.itemImageService.findOne(parseInt(id, 10));

      const itemImageResult = itemImage.toJSON();

      // search the itemImageData like params image version
      const imgVersion = await _.find(itemImageResult.ItemImageDatas, data => data['imageVersion'] === imageVersion);

      if (itemImage === null || itemImageResult.ItemImageDatas.length === 0 || !imgVersion) {
        res.status(404).send('Image Not found');
      } else {
        const dataBuffer = new Buffer(imgVersion['data'], 'base64');
        const imageBuffer = sharp(dataBuffer);
        const newInfo = await imageBuffer.metadata();
        res.setHeader('Content-Disposition', 'filename=' + imageVersion + '.'
          + newInfo.format );
        res.send(dataBuffer);
      }
    }
}

