import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { TestDataService } from '../services/TestDataService';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandInterface } from './RpcCommandInterface';
import { TestDataCreateRequest } from '../requests/TestDataCreateRequest';
import { CommandEnumType } from './CommandEnumType';
import { Command } from './Command';

export class AddDataCommand implements RpcCommandInterface<any> {

    public log: LoggerType;
    public name = 'adddata';
    public commands: CommandEnumType = new CommandEnumType();
    public command: Command = this.commands.DATA_ADD;

    constructor(
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        // this.command = this.commands.DATA_ADD;
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);
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
