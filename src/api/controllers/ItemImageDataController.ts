import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemImageDataService } from '../services/ItemImageDataService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/item-image-data', restApi.use)
export class ItemImageDataController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) private itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const itemImageDatas = await this.itemImageDataService.findAll();
        this.log.debug('findAll: ', JSON.stringify(itemImageDatas, null, 2));
        return res.found(itemImageDatas.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const itemImageData = await this.itemImageDataService.create(body);
        this.log.debug('create: ', JSON.stringify(itemImageData, null, 2));
        return res.created(itemImageData.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const itemImageData = await this.itemImageDataService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(itemImageData, null, 2));
        return res.found(itemImageData.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const itemImageData = await this.itemImageDataService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(itemImageData, null, 2));
        return res.updated(itemImageData.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.itemImageDataService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
