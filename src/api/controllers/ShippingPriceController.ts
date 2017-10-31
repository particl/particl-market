import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ShippingPriceService } from '../services/ShippingPriceService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/shipping-prices', restApi.use)
export class ShippingPriceController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingPriceService) private shippingPriceService: ShippingPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const shippingPrices = await this.shippingPriceService.findAll();
        this.log.debug('findAll: ', JSON.stringify(shippingPrices, null, 2));
        return res.found(shippingPrices.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const shippingPrice = await this.shippingPriceService.create(body);
        this.log.debug('create: ', JSON.stringify(shippingPrice, null, 2));
        return res.created(shippingPrice.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const shippingPrice = await this.shippingPriceService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(shippingPrice, null, 2));
        return res.found(shippingPrice.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const shippingPrice = await this.shippingPriceService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(shippingPrice, null, 2));
        return res.updated(shippingPrice.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.shippingPriceService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
