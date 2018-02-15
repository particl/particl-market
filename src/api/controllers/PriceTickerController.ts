import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { PriceTickerService } from '../services/PriceTickerService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/price-tickers', restApi.use)
export class PriceTickerController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.PriceTickerService) private priceTickerService: PriceTickerService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const priceTickers = await this.priceTickerService.findAll();
        this.log.debug('findAll: ', JSON.stringify(priceTickers, null, 2));
        return res.found(priceTickers.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const priceTicker = await this.priceTickerService.create(body);
        this.log.debug('create: ', JSON.stringify(priceTicker, null, 2));
        return res.created(priceTicker.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const priceTicker = await this.priceTickerService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(priceTicker, null, 2));
        return res.found(priceTicker.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const priceTicker = await this.priceTickerService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(priceTicker, null, 2));
        return res.updated(priceTicker.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.priceTickerService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
