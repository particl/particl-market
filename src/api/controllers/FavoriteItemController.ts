import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { FavoriteItemService } from '../services/FavoriteItemService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/favorite-items', restApi.use)
export class FavoriteItemController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const favoriteItems = await this.favoriteItemService.findAll();
        this.log.debug('findAll: ', JSON.stringify(favoriteItems, null, 2));
        return res.found(favoriteItems.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const favoriteItem = await this.favoriteItemService.create(body);
        this.log.debug('create: ', JSON.stringify(favoriteItem, null, 2));
        return res.created(favoriteItem.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const favoriteItem = await this.favoriteItemService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(favoriteItem, null, 2));
        return res.found(favoriteItem.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const favoriteItem = await this.favoriteItemService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(favoriteItem, null, 2));
        return res.updated(favoriteItem.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.favoriteItemService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
