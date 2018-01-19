import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { TestDataService } from '../services/TestDataService';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandInterface } from './RpcCommandInterface';
import { TestDataCreateRequest } from '../requests/TestDataCreateRequest';
import { CommandEnumType } from './CommandEnumType';
import { BaseCommand } from './BaseCommand';

export class AddDataCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(new CommandEnumType().DATA_ADD);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        const withRelated = data.params[2] ? data.params[2] : true;
        return await this.testDataService.create({
            model: data.params[0],
            data: JSON.parse(data.params[1]),
            withRelated
        } as TestDataCreateRequest);
    }

    public help(): string {
        return 'AddDataCommand: TODO: Fill in help string.';
    }

}
