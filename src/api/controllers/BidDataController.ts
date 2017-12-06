import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { BidDataService } from '../services/BidDataService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/bid-data', restApi.use)
export class BidDataController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.BidDataService) private bidDataService: BidDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const bidDatas = await this.bidDataService.findAll();
        this.log.debug('findAll: ', JSON.stringify(bidDatas, null, 2));
        return res.found(bidDatas.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const bidData = await this.bidDataService.create(body);
        this.log.debug('create: ', JSON.stringify(bidData, null, 2));
        return res.created(bidData.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const bidData = await this.bidDataService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(bidData, null, 2));
        return res.found(bidData.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const bidData = await this.bidDataService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(bidData, null, 2));
        return res.updated(bidData.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.bidDataService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
