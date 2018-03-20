import { Collection } from 'bookshelf';
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
import { MessageException } from '../exceptions/MessageException';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ItemImage } from '../models/ItemImage';
import { ItemImageData } from '../models/ItemImageData';
import { ItemInformation } from '../models/ItemInformation';


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

        const listItems: any[] = [];
        const listingItemTemplate: ListingItemTemplate = await this.listingItemTemplateService.findOne(templateId);
        for ( const file of req.files ) {
            const tmpImage = await this.itemImageService.createFile(templateId, file, listingItemTemplate);
            const imageDatas = tmpImage.ItemImageDatas;
            for ( const i in imageDatas ) {
                if ( i ) {
                    const tmpImageData: any = imageDatas[i];
                    tmpImageData.data = 'http://../../../item-image-data/' + tmpImageData.id;
                    listItems.push(tmpImageData);
                }
            }
        }
        return listItems;
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

