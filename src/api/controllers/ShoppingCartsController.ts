import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ShoppingCartsService } from '../services/ShoppingCartsService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/shopping-carts', restApi.use)
export class ShoppingCartsController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartsService) private shoppingCartsService: ShoppingCartsService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const shoppingCartss = await this.shoppingCartsService.findAll();
        this.log.debug('findAll: ', JSON.stringify(shoppingCartss, null, 2));
        return res.found(shoppingCartss.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const shoppingCarts = await this.shoppingCartsService.create(body);
        this.log.debug('create: ', JSON.stringify(shoppingCarts, null, 2));
        return res.created(shoppingCarts.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const shoppingCarts = await this.shoppingCartsService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(shoppingCarts, null, 2));
        return res.found(shoppingCarts.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const shoppingCarts = await this.shoppingCartsService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(shoppingCarts, null, 2));
        return res.updated(shoppingCarts.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.shoppingCartsService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
