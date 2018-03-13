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

        const listingItemTemplate = await this.listingItemTemplateService.findOne(templateId);
        for ( const file of req.files ) {
            if ( file.fieldname === 'image' ) {
                const imageFile = file;

                // Read the file data in
                const dataStr = fs.readFileSync(imageFile.path, 'base64');
                // this.log.error('dataStr = ' + dataStr);

                // find listing item template
                this.log.debug('imageFile.mimetype = ' + imageFile.mimetype);
                // find related itemInformation

                let retItemImage;
                const itemInformation = await listingItemTemplate.related('ItemInformation').toJSON();
                const itemImage = itemInformation.ItemImages[0];
                if ( !itemImage ) {
                    // Doesn't exist yet, create instead of update
                    retItemImage = await this.itemImageService.create(
                        {
                            item_information_id: itemInformation.id,
                            hash: ObjectHash.getHash(itemInformation),
                            data: {
                                protocol: ImageDataProtocolType.LOCAL,
                                encoding: 'BASE64',
                                data: dataStr,
                                dataId: imageFile.path,
                                originalMime: imageFile.mimetype,
                                originalName: imageFile.originalname
                            }
                        } as ItemImageUpdateRequest);
                } else {
                    const itemImageId = itemImage.id;
                    // this.log.debug('itemImage = ' + JSON.stringify(itemImage));
                    this.log.debug('itemImageId = ' + itemImageId);

                    // Update item images
                    retItemImage = await this.itemImageService.update(
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
                // Return url to image instead of image.
                retItemImage = retItemImage.toJSON();
                const retItemImages = retItemImage.ItemImageDatas;
                for ( const i in retItemImages ) {
                    if ( i ) {
                        const retImage = retItemImages[i];
                        retImage.data = 'http://../' + retImage.id;
                    }
                }
                return retItemImage;
            }
        }
        throw new MessageException('Was expecting an image file called "image".');
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

