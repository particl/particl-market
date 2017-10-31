import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { MessagingInformationService } from '../services/MessagingInformationService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/messaging-informations', restApi.use)
export class MessagingInformationController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) private messagingInformationService: MessagingInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const messagingInformations = await this.messagingInformationService.findAll();
        this.log.debug('findAll: ', JSON.stringify(messagingInformations, null, 2));
        return res.found(messagingInformations.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const messagingInformation = await this.messagingInformationService.create(body);
        this.log.debug('create: ', JSON.stringify(messagingInformation, null, 2));
        return res.created(messagingInformation.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const messagingInformation = await this.messagingInformationService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(messagingInformation, null, 2));
        return res.found(messagingInformation.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const messagingInformation = await this.messagingInformationService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(messagingInformation, null, 2));
        return res.updated(messagingInformation.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.messagingInformationService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
