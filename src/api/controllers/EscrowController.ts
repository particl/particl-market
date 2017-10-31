import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { EscrowService } from '../services/EscrowService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/escrows', restApi.use)
export class EscrowController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const escrows = await this.escrowService.findAll();
        this.log.debug('findAll: ', JSON.stringify(escrows, null, 2));
        return res.found(escrows.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const escrow = await this.escrowService.create(body);
        this.log.debug('create: ', JSON.stringify(escrow, null, 2));
        return res.created(escrow.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const escrow = await this.escrowService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(escrow, null, 2));
        return res.found(escrow.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const escrow = await this.escrowService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(escrow, null, 2));
        return res.updated(escrow.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.escrowService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
