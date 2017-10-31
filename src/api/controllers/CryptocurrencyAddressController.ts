import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { CryptocurrencyAddressService } from '../services/CryptocurrencyAddressService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/cryptocurrency-addresses', restApi.use)
export class CryptocurrencyAddressController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) private cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const cryptocurrencyAddresss = await this.cryptocurrencyAddressService.findAll();
        this.log.debug('findAll: ', JSON.stringify(cryptocurrencyAddresss, null, 2));
        return res.found(cryptocurrencyAddresss.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const cryptocurrencyAddress = await this.cryptocurrencyAddressService.create(body);
        this.log.debug('create: ', JSON.stringify(cryptocurrencyAddress, null, 2));
        return res.created(cryptocurrencyAddress.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const cryptocurrencyAddress = await this.cryptocurrencyAddressService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(cryptocurrencyAddress, null, 2));
        return res.found(cryptocurrencyAddress.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const cryptocurrencyAddress = await this.cryptocurrencyAddressService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(cryptocurrencyAddress, null, 2));
        return res.updated(cryptocurrencyAddress.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.cryptocurrencyAddressService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
