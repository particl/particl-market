import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/listing-item-templates', restApi.use)
export class ListingItemTemplateController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const listingItemTemplates = await this.listingItemTemplateService.findAll();
        this.log.debug('findAll: ', JSON.stringify(listingItemTemplates, null, 2));
        return res.found(listingItemTemplates.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const listingItemTemplate = await this.listingItemTemplateService.create(body);
        this.log.debug('create: ', JSON.stringify(listingItemTemplate, null, 2));
        return res.created(listingItemTemplate.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const listingItemTemplate = await this.listingItemTemplateService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(listingItemTemplate, null, 2));
        return res.found(listingItemTemplate.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const listingItemTemplate = await this.listingItemTemplateService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(listingItemTemplate, null, 2));
        return res.updated(listingItemTemplate.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.listingItemTemplateService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
