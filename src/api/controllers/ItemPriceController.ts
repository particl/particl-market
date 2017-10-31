import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemPriceService } from '../services/ItemPriceService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/item-prices', restApi.use)
export class ItemPriceController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const itemPrices = await this.itemPriceService.findAll();
        this.log.debug('findAll: ', JSON.stringify(itemPrices, null, 2));
        return res.found(itemPrices.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        this.log.debug('create, body: ', JSON.stringify(body, null, 2));
        const itemPrice = await this.itemPriceService.create(body);
        this.log.debug('create: ', JSON.stringify(itemPrice, null, 2));
        return res.created(itemPrice.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const itemPrice = await this.itemPriceService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(itemPrice, null, 2));
        return res.found(itemPrice.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const itemPrice = await this.itemPriceService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(itemPrice, null, 2));
        return res.updated(itemPrice.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.itemPriceService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
