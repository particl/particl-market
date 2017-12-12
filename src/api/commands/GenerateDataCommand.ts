import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { TestDataService } from '../services/TestDataService';
import { RpcRequest } from '../requests/RpcRequest';
import {RpcCommand} from './RpcCommand';

export class GenerateDataCommand implements RpcCommand<any> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'generatedata';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);

        return await this.testDataService.generate({
            model: data.params[0],
            amount: data.params[1],
            withRelated: data.params[2]
        });
    }

    public help(): string {
        return 'GenerateDataCommand: TODO: Fill in help string.';
    }
}
