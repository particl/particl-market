import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { PaymentInformationService } from '../services/PaymentInformationService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/payment-informations', restApi.use)
export class PaymentInformationController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const paymentInformations = await this.paymentInformationService.findAll();
        this.log.debug('findAll: ', JSON.stringify(paymentInformations, null, 2));
        return res.found(paymentInformations.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const paymentInformation = await this.paymentInformationService.create(body);
        this.log.debug('create: ', JSON.stringify(paymentInformation, null, 2));
        return res.created(paymentInformation.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const paymentInformation = await this.paymentInformationService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(paymentInformation, null, 2));
        return res.found(paymentInformation.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const paymentInformation = await this.paymentInformationService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(paymentInformation, null, 2));
        return res.updated(paymentInformation.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.paymentInformationService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
