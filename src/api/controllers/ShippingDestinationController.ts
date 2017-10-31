import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ShippingDestinationService } from '../services/ShippingDestinationService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/shipping-destinations', restApi.use)
export class ShippingDestinationController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const shippingDestinations = await this.shippingDestinationService.findAll();
        this.log.debug('findAll: ', JSON.stringify(shippingDestinations, null, 2));
        return res.found(shippingDestinations.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const shippingDestination = await this.shippingDestinationService.create(body);
        this.log.debug('create: ', JSON.stringify(shippingDestination, null, 2));
        return res.created(shippingDestination.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const shippingDestination = await this.shippingDestinationService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(shippingDestination, null, 2));
        return res.found(shippingDestination.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const shippingDestination = await this.shippingDestinationService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(shippingDestination, null, 2));
        return res.updated(shippingDestination.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.shippingDestinationService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
