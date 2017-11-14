import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ListingItemService } from '../services/ListingItemService';

import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/listing-items', restApi.use)
export class ListingItemController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const listingItems = await this.listingItemService.findAll();
        this.log.debug('findAll: ', JSON.stringify(listingItems, null, 2));
        return res.found(listingItems.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const listingItem = await this.listingItemService.create(body);
        this.log.debug('create: ', JSON.stringify(listingItem, null, 2));
        return res.created(listingItem.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const listingItem = await this.listingItemService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(listingItem, null, 2));
        return res.found(listingItem.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const listingItem = await this.listingItemService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(listingItem, null, 2));
        return res.updated(listingItem.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.listingItemService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here

}
