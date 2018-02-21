import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { FlaggedItemService } from '../services/FlaggedItemService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/flagged-items', restApi.use)
export class FlaggedItemController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.FlaggedItemService) private flaggedItemService: FlaggedItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const flaggedItems = await this.flaggedItemService.findAll();
        this.log.debug('findAll: ', JSON.stringify(flaggedItems, null, 2));
        return res.found(flaggedItems.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const flaggedItem = await this.flaggedItemService.create(body);
        this.log.debug('create: ', JSON.stringify(flaggedItem, null, 2));
        return res.created(flaggedItem.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const flaggedItem = await this.flaggedItemService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(flaggedItem, null, 2));
        return res.found(flaggedItem.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const flaggedItem = await this.flaggedItemService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(flaggedItem, null, 2));
        return res.updated(flaggedItem.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.flaggedItemService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
