import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { MarketService } from '../services/MarketService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/markets', restApi.use)
export class MarketController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const markets = await this.marketService.findAll();
        this.log.debug('findAll: ', JSON.stringify(markets, null, 2));
        return res.found(markets.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const market = await this.marketService.create(body);
        this.log.debug('create: ', JSON.stringify(market, null, 2));
        return res.created(market.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const market = await this.marketService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(market, null, 2));
        return res.found(market.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const market = await this.marketService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(market, null, 2));
        return res.updated(market.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.marketService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
