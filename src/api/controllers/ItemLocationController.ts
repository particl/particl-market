import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemLocationService } from '../services/ItemLocationService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/item-locations', restApi.use)
export class ItemLocationController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const itemLocations = await this.itemLocationService.findAll();
        this.log.debug('findAll: ', JSON.stringify(itemLocations, null, 2));
        return res.found(itemLocations.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const itemLocation = await this.itemLocationService.create(body);
        this.log.debug('create: ', JSON.stringify(itemLocation, null, 2));
        return res.created(itemLocation.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const itemLocation = await this.itemLocationService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(itemLocation, null, 2));
        return res.found(itemLocation.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const itemLocation = await this.itemLocationService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(itemLocation, null, 2));
        return res.updated(itemLocation.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.itemLocationService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
