import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ShoppingCartItemsService } from '../services/ShoppingCartItemsService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/shopping-cart-items', restApi.use)
export class ShoppingCartItemsController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartItemsService) private shoppingCartItemsService: ShoppingCartItemsService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const shoppingCartItemss = await this.shoppingCartItemsService.findAll();
        this.log.debug('findAll: ', JSON.stringify(shoppingCartItemss, null, 2));
        return res.found(shoppingCartItemss.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const shoppingCartItems = await this.shoppingCartItemsService.create(body);
        this.log.debug('create: ', JSON.stringify(shoppingCartItems, null, 2));
        return res.created(shoppingCartItems.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const shoppingCartItems = await this.shoppingCartItemsService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(shoppingCartItems, null, 2));
        return res.found(shoppingCartItems.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const shoppingCartItems = await this.shoppingCartItemsService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(shoppingCartItems, null, 2));
        return res.updated(shoppingCartItems.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.shoppingCartItemsService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
