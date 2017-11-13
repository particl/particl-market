import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { AddressService } from '../services/AddressService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/addresses', restApi.use)
export class AddressController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const addresss = await this.addressService.findAll();
        this.log.debug('findAll: ', JSON.stringify(addresss, null, 2));
        return res.found(addresss.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response,  @requestBody() body: any): Promise<any> {
        const address = await this.addressService.create(body);
        this.log.debug('create: ', JSON.stringify(address, null, 2));
        return res.created(address.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const address = await this.addressService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(address, null, 2));
        return res.found(address.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const address = await this.addressService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(address, null, 2));
        return res.updated(address.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.addressService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
