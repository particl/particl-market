import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { CurrencyPriceService } from '../services/CurrencyPriceService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/currency-prices', restApi.use)
export class CurrencyPriceController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CurrencyPriceService) private currencyPriceService: CurrencyPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const currencyPrices = await this.currencyPriceService.findAll();
        this.log.debug('findAll: ', JSON.stringify(currencyPrices, null, 2));
        return res.found(currencyPrices.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const currencyPrice = await this.currencyPriceService.create(body);
        this.log.debug('create: ', JSON.stringify(currencyPrice, null, 2));
        return res.created(currencyPrice.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const currencyPrice = await this.currencyPriceService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(currencyPrice, null, 2));
        return res.found(currencyPrice.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const currencyPrice = await this.currencyPriceService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(currencyPrice, null, 2));
        return res.updated(currencyPrice.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.currencyPriceService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
