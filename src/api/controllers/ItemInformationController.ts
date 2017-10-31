import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemInformationService } from '../services/ItemInformationService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/item-informations', restApi.use)
export class ItemInformationController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const itemInformations = await this.itemInformationService.findAll();
        this.log.debug('findAll: ', JSON.stringify(itemInformations, null, 2));
        return res.found(itemInformations.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const itemInformation = await this.itemInformationService.create(body);
        this.log.debug('create: ', JSON.stringify(itemInformation, null, 2));
        return res.created(itemInformation.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const itemInformation = await this.itemInformationService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(itemInformation, null, 2));
        return res.found(itemInformation.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const itemInformation = await this.itemInformationService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(itemInformation, null, 2));
        return res.updated(itemInformation.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.itemInformationService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
