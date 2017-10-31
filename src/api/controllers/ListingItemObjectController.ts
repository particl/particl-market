import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ListingItemObjectService } from '../services/ListingItemObjectService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/listing-item-objects', restApi.use)
export class ListingItemObjectController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) private listingItemObjectService: ListingItemObjectService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const listingItemObjects = await this.listingItemObjectService.findAll();
        this.log.debug('findAll: ', JSON.stringify(listingItemObjects, null, 2));
        return res.found(listingItemObjects.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const listingItemObject = await this.listingItemObjectService.create(body);
        this.log.debug('create: ', JSON.stringify(listingItemObject, null, 2));
        return res.created(listingItemObject.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const listingItemObject = await this.listingItemObjectService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(listingItemObject, null, 2));
        return res.found(listingItemObject.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const listingItemObject = await this.listingItemObjectService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(listingItemObject, null, 2));
        return res.updated(listingItemObject.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.listingItemObjectService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
