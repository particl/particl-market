import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { EscrowRatioService } from '../services/EscrowRatioService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/escrow-ratios', restApi.use)
export class EscrowRatioController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowRatioService) private escrowRatioService: EscrowRatioService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const escrowRatios = await this.escrowRatioService.findAll();
        this.log.debug('findAll: ', JSON.stringify(escrowRatios, null, 2));
        return res.found(escrowRatios.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const escrowRatio = await this.escrowRatioService.create(body);
        this.log.debug('create: ', JSON.stringify(escrowRatio, null, 2));
        return res.created(escrowRatio.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const escrowRatio = await this.escrowRatioService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(escrowRatio, null, 2));
        return res.found(escrowRatio.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const escrowRatio = await this.escrowRatioService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(escrowRatio, null, 2));
        return res.updated(escrowRatio.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.escrowRatioService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
