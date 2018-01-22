import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { TestDataService } from '../services/TestDataService';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandInterface } from './RpcCommandInterface';

export class CleanDbCommand implements RpcCommandInterface<void> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'cleandb';
        this.helpStr = 'cleandb';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        return await this.testDataService.clean(data.params);
    }

    public help(): string {
        return this.helpStr;
    }
}
